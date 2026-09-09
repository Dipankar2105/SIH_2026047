from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    prescription_id = Column(PG_UUID(as_uuid=True), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    reminder_time = Column(DateTime(timezone=True), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(30), default="pending", nullable=False)
    sent = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prescription = relationship("Prescription", back_populates="reminders")