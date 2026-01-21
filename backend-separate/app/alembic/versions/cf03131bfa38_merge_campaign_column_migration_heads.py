"""merge campaign column migration heads

Revision ID: cf03131bfa38
Revises: 44296dbf08d1, cf660b7b4af9
Create Date: 2026-01-07 16:46:12.565103

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'cf03131bfa38'
down_revision = ('44296dbf08d1', 'cf660b7b4af9')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
