"""add track a columns

Revision ID: 3d14975de7c3
Revises: 
Create Date: 2026-09-06 01:28:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = '3d14975de7c3'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    
    # patients.preferred_language
    columns = [col['name'] for col in inspector.get_columns('patients')]
    if 'preferred_language' not in columns:
        op.add_column('patients', sa.Column('preferred_language', sa.String(length=10), nullable=True, server_default='en'))
        
    # kiosk_sessions.expires_at, temp_state
    columns = [col['name'] for col in inspector.get_columns('kiosk_sessions')]
    if 'expires_at' not in columns:
        op.add_column('kiosk_sessions', sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True))
    if 'temp_state' not in columns:
        op.add_column('kiosk_sessions', sa.Column('temp_state', sa.Text(), nullable=True))
        
    # consents.scope, expires_at
    columns = [col['name'] for col in inspector.get_columns('consents')]
    if 'scope' not in columns:
        op.add_column('consents', sa.Column('scope', sa.String(length=100), nullable=True))
    if 'expires_at' not in columns:
        op.add_column('consents', sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    
    columns = [col['name'] for col in inspector.get_columns('consents')]
    if 'expires_at' in columns:
        op.drop_column('consents', 'expires_at')
    if 'scope' in columns:
        op.drop_column('consents', 'scope')
        
    columns = [col['name'] for col in inspector.get_columns('kiosk_sessions')]
    if 'temp_state' in columns:
        op.drop_column('kiosk_sessions', 'temp_state')
    if 'expires_at' in columns:
        op.drop_column('kiosk_sessions', 'expires_at')
        
    columns = [col['name'] for col in inspector.get_columns('patients')]
    if 'preferred_language' in columns:
        op.drop_column('patients', 'preferred_language')
