from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.patient import Patient
from app.schemas.patient import PatientCreate

class PatientService:
    def create_patient(self, db: Session, patient_in: PatientCreate) -> Patient:
        db_patient = Patient(**patient_in.model_dump())
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient

    def get_patient_by_id(self, db: Session, patient_id: str) -> Optional[Patient]:
        return db.query(Patient).filter(Patient.id == patient_id).first()

    def get_patient_by_phone(self, db: Session, phone_number: str) -> Optional[Patient]:
        return db.query(Patient).filter(Patient.phone_number == phone_number).first()

    def list_patients(self, db: Session, skip: int = 0, limit: int = 20) -> List[Patient]:
        return db.query(Patient).offset(skip).limit(limit).all()

patient_service = PatientService()
