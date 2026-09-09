import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.intake_answer import IntakeAnswer
from app.services.identity.patient_service import LANGUAGE_PACKS, get_language_pack

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


# Canonical clinical questions mapped to language pack keys
CLINICAL_QUESTIONS = [
    {"id": "q1", "key": "ai_question_greeting", "field": "chief_complaint", "type": "text"},
    {"id": "q2", "key": "ai_question_duration", "field": "duration", "type": "text"},
    {"id": "q3", "key": "ai_question_severity", "field": "severity", "type": "scale"},
    {"id": "q4", "key": "ai_question_conditions", "field": "past_conditions", "type": "text"},
    {"id": "q5", "key": "ai_question_medications", "field": "medications", "type": "text"},
]

# Emergency symptom keywords across multiple languages for red-flag triage
EMERGENCY_KEYWORDS = [
    # English
    "chest pain", "heart", "cardiac", "breathless", "cannot breathe", "fainted", "unconscious",
    "severe bleeding", "paralysis", "stroke", "choking",
    # Hindi
    "छाती में दर्द", "सीने में दर्द", "दिल का दौरा", "सांस फूलना", "बेहोश",
    # Marathi
    "छातीत दुखणे", "हृदयविकार", "श्वास घेण्यास त्रास", "बेहोश",
    # Tamil
    "நெஞ்சு வலி", "மாரடைப்பு", "மூச்சுத்திணறல்",
    # Telugu
    "ఛాతీ నొప్పి", "గుండెపోటు", "శ్వాస ఆడకపోవడం",
    # Kannada
    "ಎದೆ ನೋವು", "ಹೃದಯಾಘಾತ", "ಉಸಿರಾಟದ ತೊಂದರೆ",
    # Bengali
    "বুকে ব্যথা", "হার্ট অ্যাটাক", "শ্বাসকষ্ট"
]


@router.get("/questions", response_model=IntakeQuestionsResponse)
def get_intake_questions(language: str = "en"):
    """
    Returns the complete list of AI clinical intake questions in the requested language.
    Supports en, hi, mr, ta, te, kn, bn.
    """
    lang = language.lower().strip()
    pack = get_language_pack(lang)

    items: List[IntakeQuestionItem] = []
    for q in CLINICAL_QUESTIONS:
        text = pack.get(q["key"], LANGUAGE_PACKS["en"].get(q["key"], q["key"]))
        items.append(
            IntakeQuestionItem(
                id=q["id"],
                key=q["key"],
                text=text,
                field=q["field"],
                type=q["type"],
            )
        )

    return IntakeQuestionsResponse(language=lang, questions=items)


@router.post("/message", response_model=IntakeMessageResponse)
def process_intake_message(req: IntakeMessageRequest, db: Session = Depends(get_db)):
    """
    Processes a patient's intake message, detects emergency red-flags,
    and returns localized responses and the next AI clinical question in the patient's language.
    """
    lang = req.language.lower().strip() if req.language else "en"
    pack = get_language_pack(lang)
    msg_lower = req.message.lower().strip()

    # 1. Check for Emergency Red-Flags
    is_emergency = any(kw.lower() in msg_lower for kw in EMERGENCY_KEYWORDS)
    if is_emergency:
        alert_msg = pack.get("ai_critical_cardiac_alert") or pack.get("emergency_alert") or "CRITICAL EMERGENCY: Please proceed to Emergency Room immediately."
        return IntakeMessageResponse(
            reply=alert_msg,
            is_urgent=True,
            triage_priority="emergency",
            next_step=req.step,
            next_question=None,
            recommended_specialty="Cardiology",
        )

    # 2. Persist answer if session_id provided
    if req.session_id and 0 <= req.step < len(CLINICAL_QUESTIONS):
        q_meta = CLINICAL_QUESTIONS[req.step]
        q_text = pack.get(q_meta["key"], q_meta["key"])
        answer_record = IntakeAnswer(
            session_id=req.session_id,
            question_key=q_meta["key"],
            question=q_text,
            answer=req.message,
        )
        db.add(answer_record)
        db.commit()

    # 3. Determine next step and question
    next_step = req.step + 1
    if next_step < len(CLINICAL_QUESTIONS):
        next_q_meta = CLINICAL_QUESTIONS[next_step]
        next_q_text = pack.get(next_q_meta["key"], LANGUAGE_PACKS["en"].get(next_q_meta["key"], ""))
        acknowledgement = pack.get("success", "Noted.")
        return IntakeMessageResponse(
            reply=acknowledgement,
            is_urgent=False,
            triage_priority="normal",
            next_step=next_step,
            next_question=next_q_text,
            recommended_specialty=None,
        )
    else:
        # Intake complete
        complete_msg = pack.get("ai_intake_complete") or "Intake complete. The doctor has been notified."
        return IntakeMessageResponse(
            reply=complete_msg,
            is_urgent=False,
            triage_priority="normal",
            next_step=next_step,
            next_question=None,
            recommended_specialty="General Medicine",
        )
