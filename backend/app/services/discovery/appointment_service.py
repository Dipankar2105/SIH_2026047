import random
from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate

class AppointmentService:
    def book_appointment(self, db: Session, appointment_in: AppointmentCreate) -> Appointment:
        token = f"TK-{random.randint(100, 999)}"
        db_appointment = Appointment(
            **appointment_in.model_dump(),
            token_number=token,
            status="SCHEDULED"
        )
        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        return db_appointment

appointment_service = AppointmentService()
