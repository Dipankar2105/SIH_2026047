from sqlalchemy import Column, String, Text
from app.models.base import BaseModel

class Drug(BaseModel):
    __tablename__ = "drugs"

    name = Column(String(128), unique=True, index=True, nullable=False)
    generic_name = Column(String(128), index=True, nullable=True)
    category = Column(String(64), nullable=True) # Antibiotic, Analgesic, etc.
    dosage_form = Column(String(64), nullable=True) # Tablet, Syrup, Injection
    description = Column(Text, nullable=True)
