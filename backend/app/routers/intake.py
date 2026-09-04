from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.common import ResponseWrapper
from app.schemas.session import KioskSessionCreate, KioskSessionResponse
from app.schemas.intake import IntakeAnswerCreate, IntakeAnswerResponse, DialogueTurnRequest
from app.services.intake.intake_service import intake_service
from app.services.intake.dialogue_engine import dialogue_engine

router = APIRouter(prefix="/intake", tags=["Kiosk Smart Intake"])

@router.post("/session/start", response_model=ResponseWrapper[KioskSessionResponse])
def start_kiosk_session(session_in: KioskSessionCreate, db: Session = Depends(get_db)):
    kiosk_session = intake_service.create_kiosk_session(db, session_in)
    return ResponseWrapper(data=kiosk_session, message="Kiosk intake session started")

@router.post("/answer", response_model=ResponseWrapper[IntakeAnswerResponse])
def submit_answer(answer_in: IntakeAnswerCreate, db: Session = Depends(get_db)):
    ans = intake_service.record_answer(db, answer_in)
    return ResponseWrapper(data=ans, message="Answer recorded successfully")

@router.post("/dialogue/turn")
def next_dialogue_turn(req: DialogueTurnRequest):
    next_step = dialogue_engine.process_turn(
        kiosk_session_id=req.kiosk_session_id,
        patient_input=req.patient_input,
        current_step=1
    )
    return ResponseWrapper(data=next_step)
