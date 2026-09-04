from sqlalchemy.orm import Session
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate

class ReminderService:
    def create_reminder(self, db: Session, reminder_in: ReminderCreate) -> Reminder:
        reminder = Reminder(**reminder_in.model_dump())
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        return reminder

reminder_service = ReminderService()
