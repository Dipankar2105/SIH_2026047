from sqlalchemy import Column, String, ForeignKey, Integer, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Doctor(BaseModel):
    __tablename__ = "doctors"

    full_name = Column(String(128), nullable=False)
    registration_number = Column(String(64), unique=True, index=True, nullable=False)
    specialization = Column(String(128), nullable=False)
    experience_years = Column(Integer, default=0)
    phone_number = Column(String(15), nullable=False)
    email = Column(String(128), unique=True, nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id"), nullable=True)
    is_available = Column(Boolean, default=True)
    bio = Column(Text, nullable=True)

    # Relationships
    hospital = relationship("Hospital", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
