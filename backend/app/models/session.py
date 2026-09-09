from uuid import uuid4
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True)
    session_token = Column(String(255), unique=True, nullable=False)
    status = Column(String(30), default="active", nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)

    summaries = relationship("Summary", back_populates="session")