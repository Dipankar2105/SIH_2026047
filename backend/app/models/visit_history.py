from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class VisitHistory(BaseModel):
    __tablename__ = "visit_histories"

    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=True)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=True)
    visit_date = Column(DateTime, nullable=False)
    chief_complaint = Column(Text, nullable=False)
    diagnosis = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="visit_histories")
    doctor = relationship("Doctor")
    hospital = relationship("Hospital")
