"""Merge multiple heads

Revision ID: 391d3a918f0f
Revises: bde3bb00a75b, cf03131bfa38
Create Date: 2026-01-08 16:29:58.295482

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '391d3a918f0f'
down_revision = ('bde3bb00a75b', 'cf03131bfa38')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
