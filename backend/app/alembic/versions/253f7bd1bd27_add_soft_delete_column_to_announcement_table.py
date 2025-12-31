"""add soft delete column to announcement table

Revision ID: 253f7bd1bd27
Revises: a1b2c3d4e5f6
Create Date: 2025-12-26 10:25:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '253f7bd1bd27'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Add the deleted_at column to the announcement table
    op.add_column('announcement', 
                  sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    # Remove the deleted_at column from the announcement table
    op.drop_column('announcement', 'deleted_at')