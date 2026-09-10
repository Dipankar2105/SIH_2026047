"""add emergency, women_health, trusted_circle tables

Revision ID: a1b2c3d4e5f6
Revises: 
Create Date: 2026-09-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "emergency_profiles",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True),
        sa.Column("patient_id", pg.UUID(as_uuid=True), sa.ForeignKey("patients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("qr_token", sa.String(100), nullable=False, unique=True),
        sa.Column("blood_group", sa.String(10), nullable=True),
        sa.Column("known_allergies", pg.ARRAY(sa.Text), server_default="{}", nullable=False),
        sa.Column("critical_conditions", pg.ARRAY(sa.Text), server_default="{}", nullable=False),
        sa.Column("active_medications", pg.ARRAY(sa.Text), server_default="{}", nullable=False),
        sa.Column("emergency_contact_name", sa.String(150), nullable=True),
        sa.Column("emergency_contact_phone", sa.String(20), nullable=True),
        sa.Column("preferred_hospital", sa.String(200), nullable=True),
        sa.Column("is_active", sa.Boolean, server_default=sa.true(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("idx_emergency_profiles_patient_id", "emergency_profiles", ["patient_id"])
    op.create_index("idx_emergency_profiles_qr_token", "emergency_profiles", ["qr_token"])

    op.create_table(
        "women_health_timeline",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True),
        sa.Column("patient_id", pg.UUID(as_uuid=True), sa.ForeignKey("patients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("event_date", sa.Date, nullable=False),
        sa.Column("cycle_length_days", sa.Integer, nullable=True),
        sa.Column("flow_intensity", sa.String(30), nullable=True),
        sa.Column("pain_score", sa.Integer, nullable=True),
        sa.Column("symptoms", pg.JSONB, server_default="[]", nullable=False),
        sa.Column("pregnancy_trimester", sa.String(20), nullable=True),
        sa.Column("privacy_level", sa.String(30), server_default="gynae_only", nullable=False),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_women_health_timeline_patient_id", "women_health_timeline", ["patient_id"])
    op.create_index("idx_women_health_timeline_category", "women_health_timeline", ["category"])

    op.create_table(
        "trusted_circle_permissions",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True),
        sa.Column("patient_id", pg.UUID(as_uuid=True), sa.ForeignKey("patients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relative_name", sa.String(150), nullable=False),
        sa.Column("relative_phone", sa.String(20), nullable=False),
        sa.Column("relationship", sa.String(50), nullable=False),
        sa.Column("can_see_pregnancy", sa.Boolean, server_default=sa.false(), nullable=False),
        sa.Column("can_see_appointments", sa.Boolean, server_default=sa.true(), nullable=False),
        sa.Column("can_see_emergency_status", sa.Boolean, server_default=sa.true(), nullable=False),
        sa.Column("can_see_period_history", sa.Boolean, server_default=sa.false()),
        sa.Column("can_see_fertility", sa.Boolean, server_default=sa.false(), nullable=False),
        sa.Column("can_see_medications", sa.Boolean, server_default=sa.false(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_trusted_circle_patient_id", "trusted_circle_permissions", ["patient_id"])
    op.create_index("idx_trusted_circle_phone", "trusted_circle_permissions", ["relative_phone"])


def downgrade() -> None:
    op.drop_index("idx_trusted_circle_phone", table_name="trusted_circle_permissions")
    op.drop_index("idx_trusted_circle_patient_id", table_name="trusted_circle_permissions")
    op.drop_table("trusted_circle_permissions")

    op.drop_index("idx_women_health_timeline_category", table_name="women_health_timeline")
    op.drop_index("idx_women_health_timeline_patient_id", table_name="women_health_timeline")
    op.drop_table("women_health_timeline")

    op.drop_index("idx_emergency_profiles_qr_token", table_name="emergency_profiles")
    op.drop_index("idx_emergency_profiles_patient_id", table_name="emergency_profiles")
    op.drop_table("emergency_profiles")
