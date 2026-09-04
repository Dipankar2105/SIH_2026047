from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class PrescriptionItem(BaseModel):
    __tablename__ = "prescription_items"

    prescription_id = Column(String(36), ForeignKey("prescriptions.id"), nullable=False)
    drug_name = Column(String(128), nullable=False)
    dosage = Column(String(64), nullable=False) # e.g. 500mg
    frequency = Column(String(64), nullable=False) # e.g. 1-0-1 (Morning & Night)
    duration_days = Column(Integer, nullable=False)
    instructions = Column(String(256), nullable=True) # e.g. After food

    # Relationships
    prescription = relationship("Prescription", back_populates="items")
