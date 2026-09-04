from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Reminder(BaseModel):
    __tablename__ = "reminders"

    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    title = Column(String(128), nullable=False)
    reminder_time = Column(DateTime, nullable=False, index=True)
    channel = Column(String(32), default="APP") # APP, SMS, WHATSAPP
    is_sent = Column(Boolean, default=False)
    is_acknowledged = Column(Boolean, default=False)

    # Relationships
    patient = relationship("Patient", back_populates="reminders")
