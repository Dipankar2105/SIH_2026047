from uuid import uuid4
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.base import Base


class KioskSession(Base):
    __tablename__ = "kiosk_sessions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    kiosk_id = Column(String(100), nullable=False)
    session_id = Column(PG_UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=True)
    status = Column(String(30), default="active", nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)