import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class IntakeAnswer(Base):
    __tablename__ = "intake_answers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question_key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    question: Mapped[str | None] = mapped_column(Text)

    answer: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )