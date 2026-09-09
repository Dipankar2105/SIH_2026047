from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.base import Base


class IntakeAnswer(Base):
    __tablename__ = "intake_answers"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    session_id = Column(PG_UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    question_key = Column(String(100), nullable=False)
    question = Column(Text, nullable=True)
    answer = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())