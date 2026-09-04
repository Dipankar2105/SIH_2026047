from sqlalchemy import Column, String, ForeignKey, Text, Boolean, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class KioskSession(BaseModel):
    __tablename__ = "kiosk_sessions"

    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=True)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=True)
    kiosk_device_id = Column(String(64), nullable=False)
    status = Column(String(32), default="INITIATED") # INITIATED, IN_PROGRESS, TRIAGED, COMPLETED, ABORTED
    chief_complaint = Column(Text, nullable=True)
    language = Column(String(16), default="en") # en, hi, ta, te, etc.
    current_step = Column(Integer, default=1)
    is_emergency = Column(Boolean, default=False)
    triage_priority = Column(String(16), default="GREEN") # RED, YELLOW, GREEN

    # Relationships
    hospital = relationship("Hospital")
    patient = relationship("Patient")
    answers = relationship("IntakeAnswer", back_populates="kiosk_session")
    red_flags = relationship("RedFlag", back_populates="kiosk_session")
