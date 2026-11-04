"""expand_vertical_suites_persistence

Revision ID: b6e8f38db826
Revises: 5d323b46124c
Create Date: 2026-11-03 23:45:07.514159

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b6e8f38db826'
down_revision: Union[str, Sequence[str], None] = '5d323b46124c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create Construction Tables
    op.create_table('sov_applications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('project_id', sa.UUID(), nullable=False),
        sa.Column('application_number', sa.Integer(), nullable=False),
        sa.Column('period_to', sa.DateTime(), nullable=True),
        sa.Column('retainage_rate_pct', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('total_contract_value', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('total_completed_stored', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('total_retainage', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('net_payment_due', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'application_number', name='uix_sov_project_app_num')
    )

    op.create_table('sov_line_items',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('application_id', sa.UUID(), nullable=False),
        sa.Column('line_item_code', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('scheduled_value', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('work_previous', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('work_current', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('stored_materials', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('total_completed_stored', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('retainage_amount', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('current_due', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('balance_to_finish', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.ForeignKeyConstraint(['application_id'], ['sov_applications.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('change_events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('project_id', sa.UUID(), nullable=True),
        sa.Column('event_number', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('trade_scope', sa.String(), nullable=False),
        sa.Column('estimated_cost', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('actor_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('field_time_materials',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('project_id', sa.UUID(), nullable=True),
        sa.Column('change_event_id', sa.UUID(), nullable=True),
        sa.Column('date', sa.DateTime(), nullable=True),
        sa.Column('trade', sa.String(), nullable=False),
        sa.Column('worker_name', sa.String(), nullable=False),
        sa.Column('hours_worked', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('materials_cost', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('equipment_cost', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('supervisor_approved', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['change_event_id'], ['change_events.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # 2. Create Clinical Tables
    op.create_table('consent_evidences',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('study_id', sa.UUID(), nullable=False),
        sa.Column('referral_id', sa.UUID(), nullable=False),
        sa.Column('icf_document_version', sa.String(), nullable=False),
        sa.Column('signature_timestamp', sa.DateTime(), nullable=True),
        sa.Column('signature_type', sa.String(), nullable=True),
        sa.Column('verified_by', sa.UUID(), nullable=True),
        sa.Column('audit_hash', sa.String(), nullable=False),
        sa.Column('is_valid', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['referral_id'], ['referrals.id'], ),
        sa.ForeignKeyConstraint(['study_id'], ['studies.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('eligibility_criteria',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('study_id', sa.UUID(), nullable=False),
        sa.Column('criterion_type', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('clinical_threshold', sa.String(), nullable=True),
        sa.Column('protocol_section', sa.String(), nullable=True),
        sa.Column('human_verified', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['study_id'], ['studies.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('clinical_followup_tasks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('referral_id', sa.UUID(), nullable=False),
        sa.Column('task_type', sa.String(), nullable=True),
        sa.Column('scheduled_for', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['referral_id'], ['referrals.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. Create Maritime Tables
    op.create_table('rate_cards',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('carrier_name', sa.String(), nullable=False),
        sa.Column('trade_lane', sa.String(), nullable=False),
        sa.Column('container_type', sa.String(), nullable=True),
        sa.Column('base_rate', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('baf_surcharge', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('thc_surcharge', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('pss_surcharge', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('valid_from', sa.DateTime(), nullable=True),
        sa.Column('valid_to', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('milestone_events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('shipment_id', sa.UUID(), nullable=False),
        sa.Column('milestone_code', sa.String(), nullable=False),
        sa.Column('port_or_location', sa.String(), nullable=False),
        sa.Column('event_timestamp', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('demurrage_free_days_remaining', sa.Integer(), nullable=True),
        sa.Column('detention_alert', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['shipment_id'], ['shipments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('house_bills_of_lading',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('shipment_id', sa.UUID(), nullable=True),
        sa.Column('hbl_number', sa.String(), nullable=False),
        sa.Column('shipper_name', sa.String(), nullable=False),
        sa.Column('consignee_name', sa.String(), nullable=False),
        sa.Column('notify_party', sa.String(), nullable=True),
        sa.Column('vessel_voyage', sa.String(), nullable=False),
        sa.Column('port_of_loading', sa.String(), nullable=False),
        sa.Column('port_of_discharge', sa.String(), nullable=False),
        sa.Column('container_numbers', sa.Text(), nullable=True),
        sa.Column('gross_weight_kg', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('measurement_cbm', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['shipment_id'], ['shipments.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('hbl_number')
    )

    # 4. Add columns to existing vertical tables safely
    op.add_column('quotations', sa.Column('trade_lane', sa.String(), nullable=True))
    op.add_column('quotations', sa.Column('container_type', sa.String(), nullable=True))
    op.add_column('quotations', sa.Column('container_count', sa.Integer(), nullable=True))
    op.add_column('quotations', sa.Column('base_rate', sa.Numeric(precision=15, scale=2), nullable=True))
    op.add_column('quotations', sa.Column('total_surcharges', sa.Numeric(precision=15, scale=2), nullable=True))

    op.add_column('referrals', sa.Column('stage', sa.String(), nullable=True))
    op.add_column('referrals', sa.Column('referral_source', sa.String(), nullable=True))

    op.add_column('shipments', sa.Column('quotation_id', sa.UUID(), nullable=True))
    op.add_column('shipments', sa.Column('bl_number', sa.String(), nullable=True))
    op.add_column('shipments', sa.Column('origin_port', sa.String(), nullable=True))
    op.add_column('shipments', sa.Column('destination_port', sa.String(), nullable=True))

    op.add_column('sites', sa.Column('site_number', sa.String(), nullable=True))

    op.add_column('studies', sa.Column('title', sa.String(), nullable=True))
    op.add_column('studies', sa.Column('target_enrollment', sa.Integer(), nullable=True))
    op.add_column('studies', sa.Column('current_enrolled', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_table('house_bills_of_lading')
    op.drop_table('milestone_events')
    op.drop_table('rate_cards')
    op.drop_table('clinical_followup_tasks')
    op.drop_table('eligibility_criteria')
    op.drop_table('consent_evidences')
    op.drop_table('field_time_materials')
    op.drop_table('change_events')
    op.drop_table('sov_line_items')
    op.drop_table('sov_applications')
