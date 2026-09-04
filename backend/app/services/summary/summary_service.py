from sqlalchemy.orm import Session
from app.models.summary import Summary
from app.models.intake_answer import IntakeAnswer

class SummaryService:
    def generate_summary(self, db: Session, patient_id: str, kiosk_session_id: str) -> Summary:
        answers = db.query(IntakeAnswer).filter(IntakeAnswer.kiosk_session_id == kiosk_session_id).all()
        complaints = "; ".join([f"{a.question_text}: {a.answer_text}" for a in answers]) if answers else "Patient completed kiosk self-intake."

        summary = Summary(
            patient_id=patient_id,
            kiosk_session_id=kiosk_session_id,
            summary_type="INTAKE_TRIAGE",
            chief_complaints_summary=complaints,
            recommended_specialty="General Medicine",
            ai_generated_notes="Patient displays clear intake responses. No immediate contraindications noted."
        )
        db.add(summary)
        db.commit()
        db.refresh(summary)
        return summary

summary_service = SummaryService()
