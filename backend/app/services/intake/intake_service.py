from sqlalchemy.orm import Session
from app.models.kiosk_session import KioskSession
from app.models.intake_answer import IntakeAnswer
from app.schemas.session import KioskSessionCreate
from app.schemas.intake import IntakeAnswerCreate

class IntakeService:
    def create_kiosk_session(self, db: Session, session_in: KioskSessionCreate) -> KioskSession:
        kiosk = KioskSession(**session_in.model_dump())
        db.add(kiosk)
        db.commit()
        db.refresh(kiosk)
        return kiosk

    def record_answer(self, db: Session, answer_in: IntakeAnswerCreate) -> IntakeAnswer:
        answer = IntakeAnswer(**answer_in.model_dump())
        db.add(answer)
        db.commit()
        db.refresh(answer)
        return answer

intake_service = IntakeService()
