import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.intake import intake_service

router = APIRouter(prefix="/intake", tags=["AI Clinical Intake"])


class IntakeQuestionItem(BaseModel):
    id: str
    key: str
    text: str
    field: str
    type: str = "text"


class IntakeQuestionsResponse(BaseModel):
    language: str
    questions: List[IntakeQuestionItem]


class IntakeMessageRequest(BaseModel):
    message: str = Field(..., description="User's typed or voice-transcribed answer")
    language: Optional[str] = Field("en", description="ISO 639-1 language code e.g. en, hi, mr, ta, te, kn, bn")
    step: Optional[int] = Field(0, description="Current intake question step index (0 to 4)")
    session_id: Optional[uuid.UUID] = Field(None, description="Active Kiosk session ID")


class IntakeMessageResponse(BaseModel):
    reply: str
    is_urgent: bool = False
    triage_priority: str = "normal"  # normal, urgent, emergency
    next_step: int
    next_question: Optional[str] = None
    recommended_specialty: Optional[str] = None


@router.get("/questions", response_model=IntakeQuestionsResponse)
def get_intake_questions(language: str = "en"):
    """
    Returns the complete list of AI clinical intake questions in the requested language.
    Supports en, hi, mr, ta, te, kn, bn.
    """
    items = intake_service.get_intake_questions_list(language)
    return IntakeQuestionsResponse(
        language=language.lower().strip(),
        questions=[IntakeQuestionItem(**it) for it in items],
    )


@router.post("/message", response_model=IntakeMessageResponse)
def process_intake_message(req: IntakeMessageRequest, db: Session = Depends(get_db)):
    """
    Processes a patient's intake message, detects emergency red-flags,
    and returns localized responses and the next AI clinical question in the patient's language.
    """
    result = intake_service.process_intake_step(
        db=db,
        message=req.message,
        language=req.language or "en",
        step=req.step or 0,
        session_id=req.session_id,
    )
    return IntakeMessageResponse(**result)
