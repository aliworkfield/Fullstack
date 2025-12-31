"""make hashed_password column non-nullable

Revision ID: 3fb6b1a5933e
Revises: 36c6769350f9
Create Date: 2025-12-26 15:03:12.345678

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '3fb6b1a5933e'
down_revision = '36c6769350f9'
branch_labels = None
depends_on = None


def upgrade():
    # Set default value for any existing NULL values
    op.execute("UPDATE \"user\" SET hashed_password = 'dummy' WHERE hashed_password IS NULL")
    # Make the column non-nullable
    op.alter_column('user', 'hashed_password', nullable=False)


def downgrade():
    op.alter_column('user', 'hashed_password', nullable=True)