"""merge multiple heads

Revision ID: bde3bb00a75b
Revises: 3ec70de28e83, 6b08adf8d0d2
Create Date: 2026-01-08 15:10:35.624084

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'bde3bb00a75b'
down_revision = ('3ec70de28e83', '6b08adf8d0d2')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
