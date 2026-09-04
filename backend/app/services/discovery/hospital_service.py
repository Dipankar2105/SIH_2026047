from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalCreate

class HospitalService:
    def create_hospital(self, db: Session, hospital_in: HospitalCreate) -> Hospital:
        db_hospital = Hospital(**hospital_in.model_dump())
        db.add(db_hospital)
        db.commit()
        db.refresh(db_hospital)
        return db_hospital

    def list_hospitals(self, db: Session, city: Optional[str] = None) -> List[Hospital]:
        query = db.query(Hospital)
        if city:
            query = query.filter(Hospital.city.ilike(f"%{city}%"))
        return query.all()

hospital_service = HospitalService()
