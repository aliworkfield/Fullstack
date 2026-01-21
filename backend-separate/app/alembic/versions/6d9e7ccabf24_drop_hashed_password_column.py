"""drop_hashed_password_column

Revision ID: 6d9e7ccabf24
Revises: 5a1b2c3d4e5f
Create Date: 2025-12-18 12:50:32.571116

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '6d9e7ccabf24'
down_revision = '5a1b2c3d4e5f'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the hashed_password column from the user table
    op.drop_column('user', 'hashed_password')


def downgrade():
    # Add the hashed_password column back to the user table
    op.add_column('user', sa.Column('hashed_password', sqlmodel.sql.sqltypes.AutoString(), nullable=False))