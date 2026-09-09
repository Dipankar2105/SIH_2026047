from uuid import uuid4
from sqlalchemy import Column, String, Date, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    abha_id = Column(String(100), unique=True, nullable=True)
    abha_address = Column(String(100), unique=True, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(30), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact_name = Column(String(150), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    documents = relationship("Document", back_populates="patient")
    summaries = relationship("Summary", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")