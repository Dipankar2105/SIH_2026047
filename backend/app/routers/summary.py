from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ResponseWrapper
from app.schemas.summary import SummaryGenerateRequest, SummaryResponse
from app.services.summary.summary_service import summary_service

router = APIRouter(prefix="/summary", tags=["Clinical Summarizer"])

@router.post("/generate", response_model=ResponseWrapper[SummaryResponse])
def generate_clinical_summary(req: SummaryGenerateRequest, db: Session = Depends(get_db)):
    summary = summary_service.generate_summary(db, patient_id=req.patient_id, kiosk_session_id=req.kiosk_session_id)
    return ResponseWrapper(data=summary, message="Clinical summary generated successfully")
