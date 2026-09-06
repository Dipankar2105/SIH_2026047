import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    prescription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    drug_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    dosage: Mapped[str | None] = mapped_column(String(100))

    frequency: Mapped[str | None] = mapped_column(String(100))

    duration: Mapped[str | None] = mapped_column(String(100))

    quantity: Mapped[int | None] = mapped_column(Integer)

    instructions: Mapped[str | None] = mapped_column(Text)

    prescription = relationship(
        "Prescription",
        back_populates="items",
    )