"""add hpr_id to doctor

Revision ID: f123456789ab
Revises: d4e5f6a7b8c9
Create Date: 2026-09-10 00:46:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = 'f123456789ab'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    
    # doctors.hpr_id
    columns = [col['name'] for col in inspector.get_columns('doctors')]
    if 'hpr_id' not in columns:
        op.add_column('doctors', sa.Column('hpr_id', sa.String(length=50), nullable=True))
        op.create_index('ix_doctors_hpr_id', 'doctors', ['hpr_id'], unique=True)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    
    columns = [col['name'] for col in inspector.get_columns('doctors')]
    if 'hpr_id' in columns:
        op.drop_index('ix_doctors_hpr_id', table_name='doctors')
        op.drop_column('doctors', 'hpr_id')
