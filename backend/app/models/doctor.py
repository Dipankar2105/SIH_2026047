from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    hospital_id = Column(PG_UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=False)
    name = Column(String(150), nullable=False)
    specialization = Column(String(150), nullable=True)
    qualification = Column(String(255), nullable=True)
    registration_number = Column(String(100), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prescriptions = relationship("Prescription", back_populates="doctor")
    hospital = relationship("Hospital", back_populates="doctors")