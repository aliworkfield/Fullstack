"""remove hashed_password column from user table

Revision ID: dc63e53002b2
Revises: 3fb6b1a5933e
Create Date: 2025-12-26 14:54:46.751141

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'dc63e53002b2'
down_revision = '3fb6b1a5933e'
branch_labels = None
depends_on = None


def upgrade():
    # Remove the hashed_password column from the user table
    op.drop_column('user', 'hashed_password')


def downgrade():
    # Add the hashed_password column back in case of rollback
    op.add_column('user', sa.Column('hashed_password', sa.VARCHAR(length=255), autoincrement=False, nullable=False))