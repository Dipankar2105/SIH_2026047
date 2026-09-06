import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class KioskSession(Base):
    __tablename__ = "kiosk_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    kiosk_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    session_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("sessions.id", ondelete="SET NULL"),
    nullable=True,
    index=True,
    ) 

    status: Mapped[str] = mapped_column(
        String(30),
        default="active",
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )

    temp_state: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )