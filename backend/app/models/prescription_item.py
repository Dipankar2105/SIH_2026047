from uuid import uuid4
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    prescription_id = Column(PG_UUID(as_uuid=True), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    drug_name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    duration = Column(String(100), nullable=True)
    quantity = Column(Integer, nullable=True)
    instructions = Column(Text, nullable=True)

    prescription = relationship("Prescription", back_populates="items")