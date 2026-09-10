from uuid import uuid4
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class EmergencyProfile(Base):
    __tablename__ = "emergency_profiles"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    qr_token = Column(String(100), unique=True, nullable=False, index=True)
    blood_group = Column(String(10), nullable=True)
    known_allergies = Column(ARRAY(Text), default=[], nullable=False)
    critical_conditions = Column(ARRAY(Text), default=[], nullable=False)
    active_medications = Column(ARRAY(Text), default=[], nullable=False)
    emergency_contact_name = Column(String(150), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    preferred_hospital = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="emergency_profile")


Index("idx_emergency_profiles_patient_id", EmergencyProfile.patient_id)
Index("idx_emergency_profiles_qr_token", EmergencyProfile.qr_token)
