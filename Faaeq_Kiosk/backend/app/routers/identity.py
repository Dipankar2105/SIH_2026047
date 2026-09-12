import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rbac import require_roles, verify_patient_access
from app.core.security import create_access_token
from app.services.abdm.abha_service import (
    request_aadhaar_otp,
    enroll_abha,
    request_mobile_otp,
    verify_mobile_otp,
)
from app.services.identity.patient_service import (
    register_patient,
    get_patient,
    update_patient,
    update_preferred_language,
    get_language_pack,
    get_supported_languages,
    translate_text,
)
from app.services.identity.consent_service import (
    grant_consent,
    revoke_consent,
    check_consent_status,
)
from app.services.identity.kiosk_service import (
    create_kiosk_session,
    validate_kiosk_session,
    end_kiosk_session,
)
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    LanguageSelection,
    LanguagePackResponse,
    MobileOtpRequest,
    MobileOtpVerify,
    MobileOtpResponse,
    TranslateRequest,
    TranslateResponse,
)
from app.schemas.family_member import FamilyMemberCreate, FamilyMemberResponse
from app.schemas.consent import (
    ConsentCreate,
    ConsentResponse,
    ConsentStatusResponse,
)
from app.schemas.session import (
    KioskSessionCreate,
    KioskSessionResponse,
    KioskSessionEndResponse,
)

router = APIRouter(prefix="/identity", tags=["Identity"])


class AadhaarOTPRequest(BaseModel):
    aadhaar: str


class ABHAVerifyRequest(BaseModel):
    txn_id: str
    otp: str
    mobile: str = ""
    patient_id: Optional[uuid.UUID] = None


from app.core.config import settings

class TokenRequest(BaseModel):
    user_id: str
    role: str = "patient"


@router.post("/auth/token", response_model=dict)
def generate_user_token(data: TokenRequest):
    if settings.ENVIRONMENT.lower() != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token generation endpoint is only available in development environment."
        )
    token = create_access_token({"sub": data.user_id, "role": data.role})
    return {"access_token": token, "token_type": "bearer", "role": data.role}


# ABDM ABHA Endpoints
@router.post("/abha/request-otp")
def request_abha_otp(data: AadhaarOTPRequest):
    return request_aadhaar_otp(data.aadhaar)


@router.post("/abha/verify-otp")
def verify_abha_otp(data: ABHAVerifyRequest, db: Session = Depends(get_db)):
    result = enroll_abha(
        txn_id=data.txn_id,
        otp=data.otp,
        mobile=data.mobile,
    )
    
    # If a patient ID was provided and enrollment succeeded, link the ABHA data
    if data.patient_id and result.get("ABHANumber"):
        update_data = PatientUpdate(
            abha_id=result.get("ABHANumber"),
            abha_address=result.get("abha_address")
        )
        update_patient(db, data.patient_id, update_data)

    return result


@router.post("/mobile/request-otp", response_model=MobileOtpResponse)
def request_mobile_otp_endpoint(data: MobileOtpRequest):
    """
    Sends a real OTP to any 10-digit Indian mobile number using the ABDM SMS Gateway.
    """
    result = request_mobile_otp(data.mobile)
    return MobileOtpResponse(
        txnId=result.get("txnId", ""),
        message=result.get("message", "OTP sent successfully"),
    )


@router.post("/mobile/verify-otp")
def verify_mobile_otp_endpoint(data: MobileOtpVerify, db: Session = Depends(get_db)):
    """
    Verifies the mobile OTP with ABDM.
    If patient_id is supplied, links and confirms the patient.
    """
    result = verify_mobile_otp(txn_id=data.txn_id, otp=data.otp)
    if data.patient_id:
        patient = get_patient(db, data.patient_id)
        result["patient"] = PatientResponse.model_validate(patient)
    return result



class HPRVerifyRequest(BaseModel):
    hpr_id: str


@router.post("/hpr/verify")
def verify_hpr_endpoint(data: HPRVerifyRequest, db: Session = Depends(get_db)):
    """
    Simulates ABDM HPR (Healthcare Professional Registry) Verification.
    """
    from app.models.doctor import Doctor
    doctor = db.query(Doctor).filter(Doctor.hpr_id == data.hpr_id).first()
    
    if doctor:
        return {
            "hpr_id": doctor.hpr_id,
            "name": doctor.name,
            "status": "active",
            "registered_locally": True,
            "doctor_id": str(doctor.id)
        }
        
    return {
        "hpr_id": data.hpr_id,
        "name": "Dr. Unknown (Mocked HPR)",
        "status": "active",
        "registered_locally": False
    }


# Patient CRUD & Language Endpoints
@router.post("/patient/register", response_model=PatientResponse)
def register_patient_endpoint(patient_in: PatientCreate, db: Session = Depends(get_db)):
    return register_patient(db, patient_in)


@router.post("/patient/dependents", response_model=FamilyMemberResponse)
def add_dependent(
    data: FamilyMemberCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_roles("patient")),
):
    primary_patient_id = current_user.get("sub") or current_user.get("patient_id")
    
    from app.models.family_member import FamilyMember
    from app.models.patient import Patient

    # Check if dependent exists
    dependent = db.query(Patient).filter(Patient.id == data.dependent_patient_id).first()
    if not dependent:
        raise HTTPException(status_code=404, detail="Dependent patient not found")
        
    # Check if already linked
    existing = db.query(FamilyMember).filter(
        FamilyMember.primary_patient_id == primary_patient_id,
        FamilyMember.dependent_patient_id == data.dependent_patient_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Patient is already a dependent")
        
    fm = FamilyMember(
        primary_patient_id=primary_patient_id,
        dependent_patient_id=data.dependent_patient_id,
        relationship=data.relationship
    )
    db.add(fm)
    db.commit()
    db.refresh(fm)
    return fm


@router.get("/patient/dependents", response_model=List[FamilyMemberResponse])
def list_dependents(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_roles("patient")),
):
    primary_patient_id = current_user.get("sub") or current_user.get("patient_id")
    
    from app.models.family_member import FamilyMember
    dependents = db.query(FamilyMember).filter(
        FamilyMember.primary_patient_id == primary_patient_id
    ).all()
    
    return dependents


@router.get("/patient/{patient_id}", response_model=PatientResponse)
def get_patient_profile(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    return get_patient(db, patient_id)


@router.put("/patient/{patient_id}", response_model=PatientResponse)
def update_patient_profile(
    patient_id: uuid.UUID,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    return update_patient(db, patient_id, patient_in)


@router.post("/patient/{patient_id}/language", response_model=PatientResponse)
def set_preferred_language(
    patient_id: uuid.UUID,
    selection: LanguageSelection,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    return update_preferred_language(db, patient_id, selection.preferred_language)


@router.get("/languages", response_model=List[dict])
def list_supported_languages():
    return get_supported_languages()


@router.get("/languages/{language_code}", response_model=LanguagePackResponse)
def get_language_pack_endpoint(language_code: str):
    pack = get_language_pack(language_code)
    return LanguagePackResponse(language_code=language_code, translations=pack)


@router.post("/translate", response_model=TranslateResponse)
def translate_text_endpoint(req: TranslateRequest):
    """
    Translates medical terms, clinical phrases, triage statuses, or UI text
    on-the-fly into any of the 7 supported languages.
    """
    translated = translate_text(
        text=req.text,
        target_language=req.target_language,
        source_language=req.source_language or "en",
    )
    return TranslateResponse(
        original_text=req.text,
        translated_text=translated,
        source_language=req.source_language or "en",
        target_language=req.target_language,
    )



# Consent Management Endpoints
@router.post("/consent/grant", response_model=ConsentResponse)
def grant_consent_endpoint(
    consent_in: ConsentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, consent_in.patient_id, db=db)
    return grant_consent(db, consent_in)


@router.post("/consent/revoke", response_model=ConsentResponse)
def revoke_consent_endpoint(
    patient_id: uuid.UUID,
    consent_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    return revoke_consent(db, patient_id, consent_id)


@router.get("/consent/status/{patient_id}", response_model=ConsentStatusResponse)
def get_consent_status_endpoint(
    patient_id: uuid.UUID,
    consent_type: str = "health_record_sharing",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    verify_patient_access(current_user, patient_id, db=db)
    return check_consent_status(db, patient_id, consent_type)


# Kiosk Session Privacy & Lifecycle
@router.post("/kiosk/session/start", response_model=KioskSessionResponse)
def start_kiosk_session(
    session_in: KioskSessionCreate,
    db: Session = Depends(get_db),
):
    return create_kiosk_session(db, session_in)


@router.get("/kiosk/session/validate/{session_id}", response_model=KioskSessionResponse)
def validate_kiosk_session_endpoint(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return validate_kiosk_session(db, session_id)


@router.post("/kiosk/session/end/{session_id}", response_model=KioskSessionEndResponse)
def end_kiosk_session_endpoint(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return end_kiosk_session(db, session_id)