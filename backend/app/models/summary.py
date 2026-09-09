from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(PG_UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=True)
    summary_text = Column(Text, nullable=False)
    status = Column(String(30), default="draft", nullable=False)
    doctor_id = Column(PG_UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    summary_type = Column(String(30), default="clinical", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="summaries")
    session = relationship("Session", back_populates="summaries")


class FHIRBundle(Base):
    __tablename__ = "fhir_bundles"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    session_id = Column(PG_UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=True)
    bundle_data = Column(Text, nullable=False)
    abdm_compliant = Column(String(10), default="true", nullable=False)
    validation_errors = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
