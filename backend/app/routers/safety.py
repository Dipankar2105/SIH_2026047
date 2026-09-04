from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ResponseWrapper
from app.schemas.safety import TriageEvaluationResponse
from app.services.safety.red_flag_service import red_flag_service

router = APIRouter(prefix="/safety", tags=["Clinical Triage Safety"])

@router.post("/evaluate/{kiosk_session_id}", response_model=ResponseWrapper[TriageEvaluationResponse])
def evaluate_triage_safety(kiosk_session_id: str, symptom_text: str, db: Session = Depends(get_db)):
    res = red_flag_service.evaluate_text(db, kiosk_session_id, symptom_text)
    return ResponseWrapper(data=res, message="Triage safety evaluation completed")
