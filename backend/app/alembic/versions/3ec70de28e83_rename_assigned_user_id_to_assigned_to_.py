"""rename assigned_user_id to assigned_to_user_id in coupons table

Revision ID: 3ec70de28e83
Revises: 8260c6cb0110
Create Date: 2026-01-08 15:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3ec70de28e83'
down_revision = '8260c6cb0110'
branch_labels = None
depends_on = None


def upgrade():
    # Rename the column from assigned_user_id to assigned_to_user_id in coupons table
    op.alter_column('coupons', 'assigned_user_id', new_column_name='assigned_to_user_id')


def downgrade():
    # Revert the column name from assigned_to_user_id back to assigned_user_id in coupons table
    op.alter_column('coupons', 'assigned_to_user_id', new_column_name='assigned_user_id')