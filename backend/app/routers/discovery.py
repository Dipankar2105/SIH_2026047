import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.services.discovery.discovery_service import (
    recommend_doctors_for_symptoms,
    list_doctors,
    list_available_slots,
    book_appointment,
)
from app.schemas.appointment import (
    SymptomRecommendationRequest,
    DoctorRecommendationResponse,
    DoctorResponse,
    SlotListingResponse,
    AppointmentCreate,
    AppointmentResponse,
)

router = APIRouter(prefix="/discovery", tags=["Discovery & Appointments"])


@router.post("/recommend-doctor", response_model=DoctorRecommendationResponse)
def recommend_doctor_endpoint(
    req: SymptomRecommendationRequest,
    db: Session = Depends(get_db),
):
    return recommend_doctors_for_symptoms(db, req.symptoms, req.patient_id)


@router.get("/doctors", response_model=List[DoctorResponse])
def list_doctors_endpoint(
    hospital_id: Optional[uuid.UUID] = None,
    specialty: Optional[str] = None,
    patient_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
):
    return list_doctors(db, hospital_id, specialty, patient_id)


@router.get("/slots/{doctor_id}", response_model=SlotListingResponse)
def get_slots_endpoint(
    doctor_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return list_available_slots(db, doctor_id)


@router.post("/book-appointment", response_model=AppointmentResponse)
def book_appointment_endpoint(
    appt_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return book_appointment(db, appt_in)
