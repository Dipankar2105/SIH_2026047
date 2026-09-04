from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class IntakeAnswer(BaseModel):
    __tablename__ = "intake_answers"

    kiosk_session_id = Column(String(36), ForeignKey("kiosk_sessions.id"), nullable=False)
    question_id = Column(String(64), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=False)
    input_type = Column(String(32), default="text") # text, voice, select, multi_select

    # Relationships
    kiosk_session = relationship("KioskSession", back_populates="answers")
