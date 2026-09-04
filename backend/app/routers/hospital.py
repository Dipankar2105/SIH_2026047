from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ResponseWrapper
from app.schemas.hospital import HospitalCreate, HospitalResponse
from app.services.discovery.hospital_service import hospital_service

router = APIRouter(prefix="/hospital", tags=["Hospital Management"])

@router.post("", response_model=ResponseWrapper[HospitalResponse])
def create_hospital(hospital_in: HospitalCreate, db: Session = Depends(get_db)):
    hospital = hospital_service.create_hospital(db, hospital_in)
    return ResponseWrapper(data=hospital, message="Hospital created successfully")

@router.get("", response_model=ResponseWrapper[List[HospitalResponse]])
def list_hospitals(city: Optional[str] = None, db: Session = Depends(get_db)):
    hospitals = hospital_service.list_hospitals(db, city=city)
    return ResponseWrapper(data=hospitals)
