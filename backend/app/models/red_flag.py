from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.base import Base


class RedFlag(Base):
    __tablename__ = "red_flags"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    session_id = Column(PG_UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    flag_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(30), default="medium", nullable=False)
    triggered = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())