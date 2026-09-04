from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import create_access_token
from app.schemas.common import ResponseWrapper
from app.schemas.patient import PatientCreate, PatientResponse, ABHALookupRequest
from app.schemas.session import LoginRequest, TokenResponse
from app.schemas.consent import ConsentCreate, ConsentResponse
from app.services.identity.patient_service import patient_service
from app.services.identity.abha_service import abha_service
from app.services.identity.consent_service import consent_service

router = APIRouter(prefix="/identity", tags=["Identity & ABDM"])

@router.post("/register", response_model=ResponseWrapper[PatientResponse])
def register_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    patient = patient_service.create_patient(db, patient_in)
    return ResponseWrapper(data=patient, message="Patient registered successfully")

@router.post("/login", response_model=TokenResponse)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_phone(db, login_req.phone_number)
    if not patient:
        # Create lightweight patient if logging in for first time
        patient = patient_service.create_patient(
            db,
            PatientCreate(full_name="New Patient", phone_number=login_req.phone_number, gender="OTHER")
        )
    
    access_token = create_access_token(subject=patient.id, role=login_req.role)
    return TokenResponse(
        access_token=access_token,
        expires_in=3600,
        role=login_req.role,
        user_id=patient.id
    )

@router.post("/abha/lookup")
def lookup_abha(req: ABHALookupRequest):
    res = abha_service.verify_abha(req.abha_number_or_address)
    return ResponseWrapper(data=res)

@router.post("/consent/request", response_model=ResponseWrapper[ConsentResponse])
def request_consent(consent_in: ConsentCreate, db: Session = Depends(get_db)):
    consent = consent_service.request_consent(db, consent_in)
    return ResponseWrapper(data=consent, message="Consent requested successfully")
