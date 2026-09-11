from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_roles
from app.schemas.emergency import (
    EmergencyProfileCreate,
    EmergencyProfileResponse,
    EmergencyCardPublicResponse,
)
from app.services.emergency.emergency_service import emergency_service


router = APIRouter(prefix="/api/emergency", tags=["Emergency Golden Hour"])


@router.post("/profile", response_model=EmergencyProfileResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_profile(
    payload: EmergencyProfileCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("patient", "doctor", "admin")),
):
    result = emergency_service.create_or_update_profile(
        db,
        patient_id=str(payload.patient_id),
        data=payload.model_dump(exclude={"patient_id"}),
    )
    return EmergencyProfileResponse.model_validate(result)


@router.get("/qr/{qr_token}", response_model=EmergencyCardPublicResponse)
def get_public_card(qr_token: str, db: Session = Depends(get_db)):
    result = emergency_service.get_public_card_by_token(db, qr_token=qr_token)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency profile not found or inactive")
    return EmergencyCardPublicResponse(**result)


@router.get("/break-glass/{patient_id}")
def break_glass_er_access(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    doctor_id = current_user["sub"]
    result = emergency_service.break_glass_er_access(db, patient_id=patient_id, doctor_id=doctor_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency profile not found")
    return result
