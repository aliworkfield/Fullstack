"""add hashed_password column to user table

Revision ID: 36c6769350f9
Revises: 253f7bd1bd27
Create Date: 2025-12-26 14:47:48.894983

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes

# revision identifiers, used by Alembic.
revision = '36c6769350f9'
down_revision = '253f7bd1bd27'
branch_labels = None
depends_on = None


def upgrade():
    # Add hashed_password column to user table
    op.add_column('user', sa.Column('hashed_password', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True))


def downgrade():
    op.drop_column('user', 'hashed_password')