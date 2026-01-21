"""Add created_date and expiry_date to announcement table

Revision ID: a1b2c3d4e5f6
Revises: 8260c6cb0110
Create Date: 2025-12-25 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '8260c6cb0110'
branch_labels = None
depends_on = None


def upgrade():
    # Check if columns already exist before adding them
    # This prevents errors if the migration is run on a database that already has these columns
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('announcement')]
    
    if 'created_date' not in columns:
        op.add_column('announcement', sa.Column('created_date', sa.DateTime(timezone=True), nullable=True))
    
    if 'expiry_date' not in columns:
        op.add_column('announcement', sa.Column('expiry_date', sa.DateTime(timezone=True), nullable=True))
    
    # Set default values for existing records where needed
    op.execute("UPDATE announcement SET created_date = NOW() WHERE created_date IS NULL")
    op.execute("UPDATE announcement SET expiry_date = NULL WHERE expiry_date IS NULL")
    
    # Make the created_date column NOT NULL with default if it's not already
    try:
        op.alter_column('announcement', 'created_date', nullable=False, server_default=sa.text('NOW()'))
    except:
        # Column might already be NOT NULL
        pass


def downgrade():
    # Remove the created_date and expiry_date columns if they exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('announcement')]
    
    if 'expiry_date' in columns:
        op.drop_column('announcement', 'expiry_date')
    
    if 'created_date' in columns:
        op.drop_column('announcement', 'created_date')