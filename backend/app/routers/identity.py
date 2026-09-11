import uuid
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
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
    PatientLoginOtpRequest,
    PatientLoginOtpResponse,
    PatientLoginVerifyRequest,
    PatientLoginResponse,
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


# ---------------------------------------------------------------------------
# Helper utilities for ABHA Patient Login
# ---------------------------------------------------------------------------

_GENDER_MAP: Dict[str, str] = {"M": "male", "F": "female", "O": "other"}


def _normalize_abha_id(value: str) -> str:
    return "".join(ch for ch in (value or "") if ch.isdigit())


def _mask_mobile(mobile: str) -> str:
    return f"******{mobile[-4:]}"


def _parse_abha_dob(value: Any) -> Optional[date]:
    if not value or not isinstance(value, str):
        return None
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def _map_gender(value: Any) -> Optional[str]:
    if not value:
        return None
    raw = str(value).strip()
    upper = raw.upper()
    return _GENDER_MAP.get(upper, raw.lower())


def _extract_abdm_profile(result: dict) -> dict:
    profile = result.get("profile")
    if isinstance(profile, dict):
        return profile
    if isinstance(profile, list) and profile and isinstance(profile[0], dict):
        return profile[0]
    return {}


def _find_patient_by_abha(db: Session, abha_id: Optional[str], abha_address: Optional[str] = None):
    from app.models.patient import Patient

    patient = None

    if abha_id:
        patient = db.query(Patient).filter(Patient.abha_id == abha_id).first()
        if not patient:
            norm = _normalize_abha_id(abha_id)
            if norm:
                patient = (
                    db.query(Patient)
                    .filter(func.replace(Patient.abha_id, "-", "") == norm)
                    .first()
                )

    if not patient and abha_address:
        patient = db.query(Patient).filter(Patient.abha_address == abha_address).first()

    return patient


def _register_patient_from_abdm(db: Session, abha_id: str, verif_result: dict):
    profile = _extract_abdm_profile(verif_result)
    mobile = verif_result.get("mobile") or profile.get("mobile") or None

    phr_raw = profile.get("phrAddress") or profile.get("abha_address") or profile.get("abhaAddress")
    abha_address = None
    if isinstance(phr_raw, list) and phr_raw:
        abha_address = phr_raw[0]
    elif isinstance(phr_raw, str):
        abha_address = phr_raw

    create_in = PatientCreate(
        first_name=profile.get("firstName") or "Patient",
        last_name=profile.get("lastName"),
        date_of_birth=_parse_abha_dob(profile.get("dob")),
        gender=_map_gender(profile.get("gender")),
        phone=mobile,
        abha_id=(abha_id or "").strip() or None,
        abha_address=abha_address,
    )
    return register_patient(db, create_in)


# ---------------------------------------------------------------------------
# Patient ABHA Login Endpoints
# ---------------------------------------------------------------------------

@router.post("/patient/login/request-otp", response_model=PatientLoginOtpResponse)
def patient_login_request_otp(
    data: PatientLoginOtpRequest,
    db: Session = Depends(get_db),
):
    """
    Step 1 — Request mobile OTP for ABHA-based login.

    Resolves the registered mobile number from the patient's stored profile
    using the supplied abha_id / abha_address.  If a bare mobile number is
    supplied instead, the OTP is triggered directly via the ABDM SMS gateway.

    Returns a transaction ID and masked mobile for the verify step.
    """
    mobile = data.mobile

    if not mobile:
        patient = _find_patient_by_abha(db, data.abha_id, data.abha_address)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ABHA ID not found or not linked to a patient",
            )
        if not patient.phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No registered mobile number found for this patient",
            )
        mobile = patient.phone

    result = request_mobile_otp(mobile)

    return PatientLoginOtpResponse(
        txnId=result.get("txnId", ""),
        masked_mobile=_mask_mobile(mobile),
        message=result.get("message", "OTP sent successfully to your registered mobile number"),
    )


@router.post("/patient/login/verify-otp", response_model=PatientLoginResponse)
def patient_login_verify_otp(
    data: PatientLoginVerifyRequest,
    db: Session = Depends(get_db),
):
    """
    Step 2 — Verify OTP and issue a patient JWT.

    On success the patient record is resolved (or auto-registered from ABDM
    profile data if the patient has not been seen before), and a signed
    access token is returned along with the full patient profile.
    """
    try:
        result = verify_mobile_otp(txn_id=data.txn_id, otp=data.otp)
    except HTTPException as exc:
        if 400 <= exc.status_code < 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=exc.detail or "OTP verification failed or expired",
            )
        raise

    if not result.get("verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP verification failed or expired",
        )

    patient = None

    if data.patient_id:
        patient = get_patient(db, data.patient_id)
    elif data.abha_id:
        patient = _find_patient_by_abha(db, data.abha_id)
        if not patient:
            patient = _register_patient_from_abdm(db, data.abha_id, result)

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unable to resolve patient from the provided credentials",
        )

    access_token = create_access_token({"sub": str(patient.id), "role": "patient"})

    return PatientLoginResponse(
        access_token=access_token,
        token_type="bearer",
        patient=PatientResponse.model_validate(patient),
    )



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