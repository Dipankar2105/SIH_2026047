from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ResponseWrapper
from app.schemas.doctor import DoctorCreate, DoctorResponse
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.services.discovery.doctor_service import doctor_service
from app.services.discovery.appointment_service import appointment_service

router = APIRouter(prefix="/discovery", tags=["Discovery & Booking"])

@router.post("/doctors", response_model=ResponseWrapper[DoctorResponse])
def add_doctor(doctor_in: DoctorCreate, db: Session = Depends(get_db)):
    doctor = doctor_service.create_doctor(db, doctor_in)
    return ResponseWrapper(data=doctor, message="Doctor created successfully")

@router.get("/doctors", response_model=ResponseWrapper[List[DoctorResponse]])
def search_doctors(specialization: Optional[str] = None, db: Session = Depends(get_db)):
    doctors = doctor_service.search_doctors(db, specialization=specialization)
    return ResponseWrapper(data=doctors)

@router.post("/appointments", response_model=ResponseWrapper[AppointmentResponse])
def book_appointment(appointment_in: AppointmentCreate, db: Session = Depends(get_db)):
    appointment = appointment_service.book_appointment(db, appointment_in)
    return ResponseWrapper(data=appointment, message="Appointment booked successfully")
