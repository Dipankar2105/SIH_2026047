from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Summary(BaseModel):
    __tablename__ = "summaries"

    kiosk_session_id = Column(String(36), ForeignKey("kiosk_sessions.id"), nullable=True)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    summary_type = Column(String(64), default="INTAKE_TRIAGE") # INTAKE_TRIAGE, CLINICAL_ENCOUNTER
    chief_complaints_summary = Column(Text, nullable=False)
    clinical_history_summary = Column(Text, nullable=True)
    recommended_specialty = Column(String(128), nullable=True)
    ai_generated_notes = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient")
