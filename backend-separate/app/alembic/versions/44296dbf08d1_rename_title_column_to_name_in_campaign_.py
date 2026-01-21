"""rename title column to name in campaign table

Revision ID: 44296dbf08d1
Revises: 188aa9af66df
Create Date: 2026-01-05 17:00:07.726320

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '44296dbf08d1'
down_revision = '188aa9af66df'
branch_labels = None
depends_on = None


def upgrade():
    # Rename title column to name in campaign table
    op.alter_column('campaign', 'title', new_column_name='name')


def downgrade():
    # Rename name column back to title in campaign table
    op.alter_column('campaign', 'name', new_column_name='title')