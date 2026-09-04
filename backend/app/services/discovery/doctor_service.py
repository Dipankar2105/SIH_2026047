from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate

class DoctorService:
    def create_doctor(self, db: Session, doctor_in: DoctorCreate) -> Doctor:
        db_doctor = Doctor(**doctor_in.model_dump())
        db.add(db_doctor)
        db.commit()
        db.refresh(db_doctor)
        return db_doctor

    def search_doctors(self, db: Session, specialization: Optional[str] = None, city: Optional[str] = None) -> List[Doctor]:
        query = db.query(Doctor)
        if specialization:
            query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))
        return query.all()

doctor_service = DoctorService()
