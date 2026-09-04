from sqlalchemy import Column, String, Text
from app.models.base import BaseModel

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    user_id = Column(String(36), index=True, nullable=True)
    action = Column(String(64), nullable=False)
    resource = Column(String(128), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
