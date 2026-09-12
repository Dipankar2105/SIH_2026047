"""add family member

Revision ID: g234567890cd
Revises: f123456789ab
Create Date: 2026-09-10 00:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'g234567890cd'
down_revision: Union[str, None] = 'f123456789ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('family_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('primary_patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dependent_patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('relationship', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['dependent_patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['primary_patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_family_members_dependent_patient_id'), 'family_members', ['dependent_patient_id'], unique=False)
    op.create_index(op.f('ix_family_members_primary_patient_id'), 'family_members', ['primary_patient_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_family_members_primary_patient_id'), table_name='family_members')
    op.drop_index(op.f('ix_family_members_dependent_patient_id'), table_name='family_members')
    op.drop_table('family_members')
