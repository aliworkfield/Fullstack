"""remove expires_at column from announcement table

Revision ID: 09a11d6e5035
Revises: c56133da000e
Create Date: 2025-12-29 12:10:24.983641

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '09a11d6e5035'
down_revision = 'c56133da000e'
branch_labels = None
depends_on = None


def upgrade():
    # Check if the column exists before dropping it
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('announcement')]
    
    if 'expires_at' in columns:
        op.drop_column('announcement', 'expires_at')


def downgrade():
    # Add the expires_at column back if it doesn't exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('announcement')]
    
    if 'expires_at' not in columns:
        op.add_column('announcement', sa.Column('expires_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True))