from uuid import uuid4
from sqlalchemy import Column, String, Text, Integer, Date, DateTime, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class WomenTimeline(Base):
    __tablename__ = "women_health_timeline"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    event_date = Column(Date, nullable=False)
    cycle_length_days = Column(Integer, nullable=True)
    flow_intensity = Column(String(30), nullable=True)
    pain_score = Column(Integer, nullable=True)
    symptoms = Column(JSONB, default=[], nullable=False)
    pregnancy_trimester = Column(String(20), nullable=True)
    privacy_level = Column(String(30), default="gynae_only", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="women_health_timeline")


Index("idx_women_health_timeline_patient_id", WomenTimeline.patient_id)
Index("idx_women_health_timeline_category", WomenTimeline.category)
