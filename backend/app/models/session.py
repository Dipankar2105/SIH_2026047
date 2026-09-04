from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from app.models.base import BaseModel

class UserSession(BaseModel):
    __tablename__ = "user_sessions"

    user_id = Column(String(36), nullable=False, index=True)
    role = Column(String(32), nullable=False)
    token_jti = Column(String(64), unique=True, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(256), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
