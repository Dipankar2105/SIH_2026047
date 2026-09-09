from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(PG_UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False)
    file_name = Column(String(255), nullable=True)
    storage_path = Column(Text, nullable=True)
    mime_type = Column(String(100), nullable=True)
    ocr_text = Column(Text, nullable=True)
    ocr_data = Column(JSON, nullable=True)
    status = Column(String(30), default="uploaded", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="documents")
