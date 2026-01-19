"""rename campaign name column to title

Revision ID: 2448698febe6
Revises: 1140d31a3f9d
Create Date: 2025-12-31 13:57:02.103657

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '2448698febe6'
down_revision = '1140d31a3f9d'
branch_labels = None
depends_on = None


def upgrade():
    # The column is already named 'title' in the database, so no action needed
    # The model needs to be updated to match the database schema
    pass


def downgrade():
    # The column is already named 'title' in the database, so no action needed for downgrade
    # If we needed to revert, we'd need to rename 'title' back to 'name'
    # But this is not needed since the column is already 'title'
    pass