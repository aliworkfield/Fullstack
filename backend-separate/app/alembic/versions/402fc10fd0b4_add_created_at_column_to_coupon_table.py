"""add created_at column to coupon table

Revision ID: 402fc10fd0b4
Revises: 2448698febe6
Create Date: 2026-01-05 15:12:14.821799

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '402fc10fd0b4'
down_revision = '2448698febe6'
branch_labels = None
depends_on = None


def upgrade():
    # Add created_at column to coupon table
    op.add_column('coupon', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True))


def downgrade():
    # Remove created_at column from coupon table
    op.drop_column('coupon', 'created_at')
