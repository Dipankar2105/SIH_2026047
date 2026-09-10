import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.models.session import Session as DbSession
from app.models.kiosk_session import KioskSession
from app.models.intake_answer import IntakeAnswer
from app.services.identity.patient_service import LANGUAGE_PACKS, get_language_pack
from app.services.safety.red_flag_service import detect_red_flags, record_red_flag
from app.services.summary.summary_service import generate_summary_from_intake

CLINICAL_QUESTIONS = [
    {"id": "q1", "key": "ai_question_greeting", "field": "chief_complaint", "type": "text"},
    {"id": "q2", "key": "ai_question_duration", "field": "duration", "type": "text"},
    {"id": "q3", "key": "ai_question_severity", "field": "severity", "type": "scale"},
    {"id": "q4", "key": "ai_question_conditions", "field": "past_conditions", "type": "text"},
    {"id": "q5", "key": "ai_question_medications", "field": "medications", "type": "text"},
]


def resolve_core_session_id(db: Session, session_id: Optional[uuid.UUID]) -> Optional[uuid.UUID]:
    """
    Resolves a UUID to the parent Session.id, whether the caller supplied
    a Session.id or a KioskSession.id.
    """
    if not session_id:
        return None

    # Check if direct Session.id
    core_s = db.query(DbSession).filter(DbSession.id == session_id).first()
    if core_s:
        return core_s.id

    # Check if KioskSession.id
    kiosk_s = db.query(KioskSession).filter(KioskSession.id == session_id).first()
    if kiosk_s and kiosk_s.session_id:
        return kiosk_s.session_id

    return None


def get_intake_questions_list(language: str = "en") -> List[Dict[str, Any]]:
    lang = language.lower().strip()
    pack = get_language_pack(lang)

    items = []
    for q in CLINICAL_QUESTIONS:
        text = pack.get(q["key"], LANGUAGE_PACKS["en"].get(q["key"], q["key"]))
        items.append({
            "id": q["id"],
            "key": q["key"],
            "text": text,
            "field": q["field"],
            "type": q["type"],
        })
    return items


def process_intake_step(
    db: Session,
    message: str,
    language: str = "en",
    step: int = 0,
    session_id: Optional[uuid.UUID] = None,
) -> Dict[str, Any]:
    lang = language.lower().strip() if language else "en"
    pack = get_language_pack(lang)
    actual_session_id = resolve_core_session_id(db, session_id)

    # 1. Emergency Red-Flag detection
    is_emergency, severity, specialty, rule_cat = detect_red_flags(message)
    if is_emergency:
        alert_msg = (
            pack.get("ai_critical_cardiac_alert")
            or pack.get("emergency_alert")
            or "CRITICAL EMERGENCY: Please proceed to Emergency Room immediately."
        )
        if actual_session_id:
            record_red_flag(
                db,
                session_id=actual_session_id,
                flag_type="EMERGENCY_RED_FLAG",
                description=f"Emergency symptom detected in intake: {message}",
                severity=severity,
            )

        return {
            "reply": alert_msg,
            "is_urgent": True,
            "triage_priority": "emergency",
            "next_step": step,
            "next_question": None,
            "recommended_specialty": specialty or "Cardiology",
        }

    # 2. Persist answer if session is available
    if actual_session_id and 0 <= step < len(CLINICAL_QUESTIONS):
        q_meta = CLINICAL_QUESTIONS[step]
        q_text = pack.get(q_meta["key"], q_meta["key"])
        answer_record = IntakeAnswer(
            session_id=actual_session_id,
            question_key=q_meta["key"],
            question=q_text,
            answer=message,
        )
        db.add(answer_record)
        db.commit()

    # 3. Next step progression
    next_step = step + 1
    if next_step < len(CLINICAL_QUESTIONS):
        next_q_meta = CLINICAL_QUESTIONS[next_step]
        next_q_text = pack.get(next_q_meta["key"], LANGUAGE_PACKS["en"].get(next_q_meta["key"], ""))
        acknowledgement = pack.get("success", "Noted.")
        return {
            "reply": acknowledgement,
            "is_urgent": False,
            "triage_priority": "normal",
            "next_step": next_step,
            "next_question": next_q_text,
            "recommended_specialty": None,
        }
    else:
        # Intake completed
        complete_msg = pack.get("ai_intake_complete") or "Intake complete. The doctor has been notified."

        # Automatically generate summary if session is linked to a patient
        if actual_session_id:
            db_session = db.query(DbSession).filter(DbSession.id == actual_session_id).first()
            if db_session and db_session.patient_id:
                try:
                    generate_summary_from_intake(
                        db,
                        patient_id=db_session.patient_id,
                        session_id=actual_session_id,
                        specialty="General Medicine",
                    )
                except Exception:
                    pass

        return {
            "reply": complete_msg,
            "is_urgent": False,
            "triage_priority": "normal",
            "next_step": next_step,
            "next_question": None,
            "recommended_specialty": "General Medicine",
        }
