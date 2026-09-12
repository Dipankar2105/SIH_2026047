import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class FHIRBundle(Base):
    __tablename__ = "fhir_bundles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    patient_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    bundle_json: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    bundle_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    abdm_compliant: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    @property
    def validation_errors(self) -> str | None:
        if isinstance(self.bundle_json, dict):
            errs = self.bundle_json.get("validation_errors")
            if isinstance(errs, list):
                return "; ".join(errs)
            return errs
        return None

    @validation_errors.setter
    def validation_errors(self, val):
        if not isinstance(self.bundle_json, dict):
            self.bundle_json = {}
        if isinstance(val, str):
            self.bundle_json["validation_errors"] = val.split("; ")
        elif isinstance(val, list):
            self.bundle_json["validation_errors"] = val

    @property
    def bundle_data(self) -> str:
        import json
        if isinstance(self.bundle_json, str):
            return self.bundle_json
        return json.dumps(self.bundle_json)

    @bundle_data.setter
    def bundle_data(self, val):
        import json
        if isinstance(val, str):
            try:
                self.bundle_json = json.loads(val)
            except Exception:
                self.bundle_json = {"raw": val}
        elif isinstance(val, dict):
            self.bundle_json = val

    patient = relationship(
        "Patient",
        back_populates="fhir_bundles",
    )

    session = relationship(
        "Session",
        back_populates="fhir_bundles",
    )
