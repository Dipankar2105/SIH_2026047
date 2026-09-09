from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.base import Base


class Consent(Base):
    __tablename__ = "consents"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    consent_type = Column(String(100), nullable=False)
    granted = Column(Boolean, default=False, nullable=False)
    purpose = Column(Text, nullable=True)
    granted_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())