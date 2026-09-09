from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(PG_UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    appointment_id = Column(PG_UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    session_id = Column(PG_UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=True)
    status = Column(String(30), default="draft", nullable=False)
    notes = Column(Text, nullable=True)
    prescribed_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    appointment = relationship("Appointment", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="prescription", cascade="all, delete-orphan")
