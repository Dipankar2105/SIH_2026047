from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ResponseWrapper
from app.services.fhir.fhir_service import fhir_service

router = APIRouter(prefix="/fhir", tags=["FHIR R4 Interoperability"])

@router.get("/Patient/{patient_id}/$export")
def export_patient_fhir_bundle(patient_id: str, db: Session = Depends(get_db)):
    bundle = fhir_service.export_patient_bundle(db, patient_id)
    return ResponseWrapper(data=bundle, message="FHIR Bundle exported successfully")
