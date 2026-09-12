import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    specialization: Mapped[str | None] = mapped_column(
        String(150),
        index=True,
    )

    qualification: Mapped[str | None] = mapped_column(String(255))

    registration_number: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
    )

    hpr_id: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        index=True,
        doc="Healthcare Professional Registry ID from ABDM"
    )

    phone: Mapped[str | None] = mapped_column(String(20))

    email: Mapped[str | None] = mapped_column(String(255))

    bio: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    hospital = relationship(
        "Hospital",
        back_populates="doctors",
    )

    appointments = relationship(
        "Appointment",
        back_populates="doctor",
    )

    prescriptions = relationship(
        "Prescription",
        back_populates="doctor",
    )

    summaries = relationship(
        "Summary",
        back_populates="doctor",
    )

    visit_histories = relationship(
        "VisitHistory",
        back_populates="doctor",
    )