"""merge expires_at column removal migrations

Revision ID: 1140d31a3f9d
Revises: 09a11d6e5035, 3fa7713f19a5
Create Date: 2025-12-29 12:17:45.373972

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '1140d31a3f9d'
down_revision = ('09a11d6e5035', '3fa7713f19a5')
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