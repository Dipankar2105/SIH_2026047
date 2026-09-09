from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_roles
from app.schemas.prescription import (
    DrugSearchResult,
    PrescriptionCreateRequest,
    PrescriptionResponse,
    PharmacistViewResponse,
)
from app.schemas.reminder import ReminderCreateRequest, ReminderResponse, ReminderListResponse
from app.services.prescription.prescription_service import prescription_service
from app.services.prescription.reminder_service import reminder_service


router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])


@router.get("/drugs/search", response_model=list[DrugSearchResult])
def search_drugs(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    results = prescription_service.search_drugs(db, query=q, limit=limit)
    return results


@router.post("/create", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(
    payload: PrescriptionCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    doctor_id = current_user["sub"]
    result = prescription_service.create_prescription(db, payload, doctor_id=doctor_id)
    return PrescriptionResponse.model_validate(result)


@router.post("/{prescription_id}/sign", response_model=PrescriptionResponse)
def sign_prescription(
    prescription_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    doctor_id = current_user["sub"]
    try:
        result = prescription_service.sign_prescription(db, prescription_id=prescription_id, doctor_id=doctor_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return PrescriptionResponse.model_validate(result)


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    result = prescription_service.get_prescription(db, prescription_id=prescription_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return PrescriptionResponse.model_validate(result)


@router.get("/{prescription_id}/pharmacist", response_model=PharmacistViewResponse)
def get_pharmacist_view(
    prescription_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("pharmacist", "doctor")),
):
    try:
        result = prescription_service.get_pharmacist_view(db, prescription_id=prescription_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return PharmacistViewResponse(**result)


@router.get("/patient/{patient_id}", response_model=list[PrescriptionResponse])
def get_patient_prescriptions(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    results = prescription_service.get_patient_prescriptions(db, patient_id=patient_id)
    return [PrescriptionResponse.model_validate(r) for r in results]


@router.post("/{prescription_id}/reminders", response_model=list[ReminderResponse], status_code=status.HTTP_201_CREATED)
def create_reminders(
    prescription_id: str,
    payload: ReminderCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    results = reminder_service.create_reminders(db, prescription_id=prescription_id)
    return [ReminderResponse.model_validate(r) for r in results]


@router.get("/reminders/patient/{patient_id}", response_model=ReminderListResponse)
def get_patient_reminders(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor")),
):
    result = reminder_service.get_patient_reminders(db, patient_id=patient_id)
    return ReminderListResponse.model_validate(result)
