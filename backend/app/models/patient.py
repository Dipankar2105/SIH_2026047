import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    abha_id: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
        index=True,
    )

    abha_address: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
    )

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100))

    date_of_birth: Mapped[date | None] = mapped_column(Date)

    gender: Mapped[str | None] = mapped_column(String(30))

    phone: Mapped[str | None] = mapped_column(
        String(20),
        index=True,
    )

    preferred_language: Mapped[str | None] = mapped_column(
        String(10),
        default="en",
    )

    email: Mapped[str | None] = mapped_column(String(255))

    address: Mapped[str | None] = mapped_column(Text)

    emergency_contact_name: Mapped[str | None] = mapped_column(String(150))
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(20))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    appointments = relationship(
        "Appointment",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    documents = relationship(
        "Document",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    prescriptions = relationship(
        "Prescription",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    summaries = relationship(
        "Summary",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    consents = relationship(
        "Consent",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    sessions = relationship(
        "Session",
        back_populates="patient",
    )

    visit_histories = relationship(
        "VisitHistory",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    fhir_bundles = relationship(
        "FHIRBundle",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    dependents = relationship(
        "FamilyMember",
        foreign_keys="FamilyMember.primary_patient_id",
        back_populates="primary_patient",
        cascade="all, delete-orphan",
    )