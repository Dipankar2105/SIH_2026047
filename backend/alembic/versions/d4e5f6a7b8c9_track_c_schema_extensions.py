"""track c schema extensions

Revision ID: d4e5f6a7b8c9
Revises: 937a71ceb24e
Create Date: 2026-09-08 23:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = '937a71ceb24e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()

    # 1. documents.ocr_data
    if 'documents' in existing_tables:
        doc_cols = [c['name'] for c in inspector.get_columns('documents')]
        if 'ocr_data' not in doc_cols:
            op.add_column('documents', sa.Column('ocr_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    # 2. summaries: status, doctor_id, summary_type
    if 'summaries' in existing_tables:
        summary_cols = [c['name'] for c in inspector.get_columns('summaries')]
        if 'status' not in summary_cols:
            op.add_column('summaries', sa.Column('status', sa.String(length=30), server_default='draft', nullable=False))
        if 'doctor_id' not in summary_cols:
            op.add_column('summaries', sa.Column('doctor_id', postgresql.UUID(as_uuid=True), nullable=True))
            op.create_foreign_key(
                'fk_summaries_doctor_id_doctors',
                'summaries',
                'doctors',
                ['doctor_id'],
                ['id'],
                ondelete='SET NULL'
            )
            op.create_index('ix_summaries_doctor_id', 'summaries', ['doctor_id'])
        if 'summary_type' not in summary_cols:
            op.add_column('summaries', sa.Column('summary_type', sa.String(length=50), server_default='clinical', nullable=False))

    # 3. prescriptions.session_id
    if 'prescriptions' in existing_tables:
        presc_cols = [c['name'] for c in inspector.get_columns('prescriptions')]
        if 'session_id' not in presc_cols:
            op.add_column('prescriptions', sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=True))
            op.create_foreign_key(
                'fk_prescriptions_session_id_sessions',
                'prescriptions',
                'sessions',
                ['session_id'],
                ['id'],
                ondelete='SET NULL'
            )
            op.create_index('ix_prescriptions_session_id', 'prescriptions', ['session_id'])

    # 4. fhir_bundles table
    if 'fhir_bundles' not in existing_tables:
        op.create_table(
            'fhir_bundles',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patients.id', ondelete='CASCADE'), nullable=True),
            sa.Column('session_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sessions.id', ondelete='SET NULL'), nullable=True),
            sa.Column('bundle_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
            sa.Column('bundle_type', sa.String(length=50), nullable=True),
            sa.Column('abdm_compliant', sa.Boolean(), server_default=sa.text('false'), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )
        op.create_index('ix_fhir_bundles_patient_id', 'fhir_bundles', ['patient_id'])
        op.create_index('ix_fhir_bundles_session_id', 'fhir_bundles', ['session_id'])


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()

    # 4. drop fhir_bundles
    if 'fhir_bundles' in existing_tables:
        op.drop_index('ix_fhir_bundles_session_id', table_name='fhir_bundles')
        op.drop_index('ix_fhir_bundles_patient_id', table_name='fhir_bundles')
        op.drop_table('fhir_bundles')

    # 3. drop prescriptions.session_id
    if 'prescriptions' in existing_tables:
        presc_cols = [c['name'] for c in inspector.get_columns('prescriptions')]
        if 'session_id' in presc_cols:
            op.drop_constraint('fk_prescriptions_session_id_sessions', 'prescriptions', type_='foreignkey')
            op.drop_index('ix_prescriptions_session_id', table_name='prescriptions')
            op.drop_column('prescriptions', 'session_id')

    # 2. drop summaries columns
    if 'summaries' in existing_tables:
        summary_cols = [c['name'] for c in inspector.get_columns('summaries')]
        if 'summary_type' in summary_cols:
            op.drop_column('summaries', 'summary_type')
        if 'doctor_id' in summary_cols:
            op.drop_constraint('fk_summaries_doctor_id_doctors', 'summaries', type_='foreignkey')
            op.drop_index('ix_summaries_doctor_id', table_name='summaries')
            op.drop_column('summaries', 'doctor_id')
        if 'status' in summary_cols:
            op.drop_column('summaries', 'status')

    # 1. drop documents.ocr_data
    if 'documents' in existing_tables:
        doc_cols = [c['name'] for c in inspector.get_columns('documents')]
        if 'ocr_data' in doc_cols:
            op.drop_column('documents', 'ocr_data')
