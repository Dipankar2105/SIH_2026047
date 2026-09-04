from sqlalchemy import Column, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class RedFlag(BaseModel):
    __tablename__ = "red_flags"

    kiosk_session_id = Column(String(36), ForeignKey("kiosk_sessions.id"), nullable=False)
    rule_id = Column(String(64), nullable=False)
    severity = Column(String(16), nullable=False) # CRITICAL, HIGH, MODERATE
    trigger_symptom = Column(String(128), nullable=False)
    recommendation = Column(Text, nullable=False)
    alert_sent = Column(Boolean, default=False)

    # Relationships
    kiosk_session = relationship("KioskSession", back_populates="red_flags")
