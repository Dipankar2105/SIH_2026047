from sqlalchemy import Column, String, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Document(BaseModel):
    __tablename__ = "documents"

    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    title = Column(String(128), nullable=False)
    document_type = Column(String(64), nullable=False) # LAB_REPORT, PRESCRIPTION, SCAN, DISCHARGE_SUMMARY
    file_path = Column(String(256), nullable=False)
    ocr_status = Column(String(32), default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    extracted_text = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="documents")
