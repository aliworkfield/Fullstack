"""rename is_active column to active in campaigns table

Revision ID: abbc7133a048
Revises: 2448698febe6
Create Date: 2026-01-05 14:21:24.610513

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'abbc7133a048'
down_revision = '2448698febe6'
branch_labels = None
depends_on = None


def upgrade():
    # Rename the is_active column to active in the campaign table
    op.alter_column('campaign', 'is_active', new_column_name='active')


def downgrade():
    # Rename the active column back to is_active in the campaign table
    op.alter_column('campaign', 'active', new_column_name='is_active')
