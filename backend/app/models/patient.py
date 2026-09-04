from sqlalchemy import Column, String, Integer, Date, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Patient(BaseModel):
    __tablename__ = "patients"

    abha_number = Column(String(32), unique=True, index=True, nullable=True)
    abha_address = Column(String(64), unique=True, index=True, nullable=True)
    full_name = Column(String(128), nullable=False)
    phone_number = Column(String(15), index=True, nullable=False)
    email = Column(String(128), nullable=True)
    gender = Column(String(16), nullable=False) # MALE, FEMALE, OTHER
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    blood_group = Column(String(8), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(15), nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    appointments = relationship("Appointment", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    documents = relationship("Document", back_populates="patient")
    visit_histories = relationship("VisitHistory", back_populates="patient")
    reminders = relationship("Reminder", back_populates="patient")
