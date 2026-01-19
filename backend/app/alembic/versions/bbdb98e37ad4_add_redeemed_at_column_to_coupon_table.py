"""add redeemed_at column to coupon table

Revision ID: bbdb98e37ad4
Revises: 8d4b6939d0a5
Create Date: 2026-01-05 16:31:12.782957

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bbdb98e37ad4'
down_revision = '8d4b6939d0a5'
branch_labels = None
depends_on = None


def upgrade():
    # Add redeemed_at column to coupon table
    op.add_column('coupon', sa.Column('redeemed_at', sa.DateTime(), nullable=True))


def downgrade():
    # Remove redeemed_at column from coupon table
    op.drop_column('coupon', 'redeemed_at')