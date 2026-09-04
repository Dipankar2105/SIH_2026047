from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Appointment(BaseModel):
    __tablename__ = "appointments"

    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=False)
    appointment_time = Column(DateTime, nullable=False, index=True)
    status = Column(String(32), default="SCHEDULED") # SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    reason = Column(Text, nullable=True)
    token_number = Column(String(16), nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    hospital = relationship("Hospital", back_populates="appointments")
