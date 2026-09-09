from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, Boolean, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.base import Base


class Drug(Base):
    __tablename__ = "drugs"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(200), nullable=False)
    generic_name = Column(String(200), nullable=True)
    strength = Column(String(100), nullable=True)
    dosage_form = Column(String(100), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())