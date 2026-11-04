"""add_tenant_industry_column

Revision ID: c7f1a8e2d39b
Revises: b6e8f38db826
Create Date: 2026-11-04 00:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c7f1a8e2d39b'
down_revision: Union[str, Sequence[str], None] = 'b6e8f38db826'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Fail-closed industry entitlement: nullable=True, no unrestricted default
    op.add_column('tenants', sa.Column('industry', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('tenants', 'industry')

