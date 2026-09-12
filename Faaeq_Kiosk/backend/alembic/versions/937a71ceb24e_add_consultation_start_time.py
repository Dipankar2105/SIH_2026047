"""add_consultation_start_time

Revision ID: 937a71ceb24e
Revises: 3d14975de7c3
Create Date: 2026-09-06 19:41:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '937a71ceb24e'
down_revision: Union[str, None] = '3d14975de7c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('appointments', sa.Column('consultation_start_time', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('appointments', 'consultation_start_time')
