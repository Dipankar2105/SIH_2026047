from uuid import uuid4
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship as orm_relationship
from app.models.base import Base


class TrustedCircle(Base):
    __tablename__ = "trusted_circle_permissions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    relative_name = Column(String(150), nullable=False)
    relative_phone = Column(String(20), nullable=False)
    relationship = Column(String(50), nullable=False)
    can_see_pregnancy = Column(Boolean, default=False, nullable=False)
    can_see_appointments = Column(Boolean, default=True, nullable=False)
    can_see_emergency_status = Column(Boolean, default=True, nullable=False)
    can_see_period_history = Column(Boolean, default=False, nullable=False)
    can_see_fertility = Column(Boolean, default=False, nullable=False)
    can_see_medications = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = orm_relationship("Patient", back_populates="trusted_circle_permissions")


Index("idx_trusted_circle_patient_id", TrustedCircle.patient_id)
Index("idx_trusted_circle_phone", TrustedCircle.relative_phone)
