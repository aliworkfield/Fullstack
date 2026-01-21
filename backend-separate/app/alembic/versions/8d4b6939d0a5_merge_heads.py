"""merge heads

Revision ID: 8d4b6939d0a5
Revises: 402fc10fd0b4, abbc7133a048
Create Date: 2026-01-05 16:26:05.266259

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '8d4b6939d0a5'
down_revision = ('402fc10fd0b4', 'abbc7133a048')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
