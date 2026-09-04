from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Consent(BaseModel):
    __tablename__ = "consents"

    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    consent_id = Column(String(64), unique=True, index=True, nullable=False) # ABDM Consent Artifact ID
    purpose = Column(String(128), nullable=False)
    status = Column(String(32), default="REQUESTED") # REQUESTED, GRANTED, DENIED, EXPIRED, REVOKED
    granted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    hi_types = Column(Text, nullable=False) # JSON list e.g., ["Prescription", "DiagnosticReport"]

    # Relationships
    patient = relationship("Patient")
