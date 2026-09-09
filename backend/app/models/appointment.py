from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(PG_UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    hospital_id = Column(PG_UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=True)
    appointment_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(30), default="scheduled", nullable=False)
    reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prescriptions = relationship("Prescription", back_populates="appointment")