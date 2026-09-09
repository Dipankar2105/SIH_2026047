from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.base import Base


class VisitHistory(Base):
    __tablename__ = "visit_history"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(PG_UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    hospital_id = Column(PG_UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=True)
    visit_date = Column(DateTime(timezone=True), nullable=False)
    diagnosis = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())