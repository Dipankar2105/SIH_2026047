from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ResponseWrapper
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse
from app.schemas.reminder import ReminderCreate, ReminderResponse
from app.services.prescription.prescription_service import prescription_service
from app.services.prescription.reminder_service import reminder_service

router = APIRouter(prefix="/prescription", tags=["Prescription & Medication Reminders"])

@router.post("", response_model=ResponseWrapper[PrescriptionResponse])
def create_prescription(prescription_in: PrescriptionCreate, db: Session = Depends(get_db)):
    prescription = prescription_service.create_prescription(db, prescription_in)
    return ResponseWrapper(data=prescription, message="Prescription created successfully")

@router.post("/reminders", response_model=ResponseWrapper[ReminderResponse])
def create_medication_reminder(reminder_in: ReminderCreate, db: Session = Depends(get_db)):
    reminder = reminder_service.create_reminder(db, reminder_in)
    return ResponseWrapper(data=reminder, message="Reminder scheduled successfully")
