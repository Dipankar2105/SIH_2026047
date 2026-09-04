from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Hospital(BaseModel):
    __tablename__ = "hospitals"

    name = Column(String(128), nullable=False, index=True)
    facility_id = Column(String(64), unique=True, index=True, nullable=True) # ABDM Health Facility ID
    address = Column(Text, nullable=False)
    city = Column(String(64), nullable=False, index=True)
    state = Column(String(64), nullable=False)
    pincode = Column(String(10), nullable=False)
    contact_number = Column(String(15), nullable=False)
    email = Column(String(128), nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    doctors = relationship("Doctor", back_populates="hospital")
    appointments = relationship("Appointment", back_populates="hospital")
