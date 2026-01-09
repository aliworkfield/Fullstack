"""rename assigned_user_id to assigned_to_user_id in coupons table

Revision ID: 6b08adf8d0d2
Revises: cf03131bfa38
Create Date: 2026-01-08 15:07:01.924301

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6b08adf8d0d2'
down_revision = 'cf03131bfa38'
branch_labels = None
depends_on = None


def upgrade():
    # This is a placeholder migration that does nothing
    # The actual migration was moved to 3ec70de28e83
    pass


def downgrade():
    # This is a placeholder migration that does nothing
    pass