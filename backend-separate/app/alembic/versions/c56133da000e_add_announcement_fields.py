"""add announcement fields

Revision ID: c56133da000e
Revises: dc63e53002b2
Create Date: 2025-12-26 15:28:12.361061

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c56133da000e'
down_revision = 'dc63e53002b2'
branch_labels = None
depends_on = None


def upgrade():
    # Add the new columns to the announcement table
    op.add_column('announcement', sa.Column('requires_coupon', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('announcement', sa.Column('is_published', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('announcement', sa.Column('publish_date', sa.DateTime(), nullable=True))
    op.add_column('announcement', sa.Column('expires_at', sa.DateTime(), nullable=True))
    
    # Update the description column to increase its length
    op.alter_column('announcement', 'description',
               existing_type=sa.VARCHAR(length=1000),
               type_=sqlmodel.sql.sqltypes.AutoString(length=5000),
               existing_nullable=True)
    
    # Ensure category column is not nullable
    op.alter_column('announcement', 'category',
               existing_type=sa.VARCHAR(length=100),
               nullable=False)
    
    # Update the created_date column type
    op.alter_column('announcement', 'created_date',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               type_=sa.DateTime(),
               nullable=True,
               existing_server_default=sa.text('now()'))
    
    # Update the expiry_date column type
    op.alter_column('announcement', 'expiry_date',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=True)
    
    # Update the deleted_at column type
    op.alter_column('announcement', 'deleted_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=True)


def downgrade():
    # Remove the new columns from the announcement table
    op.drop_column('announcement', 'expires_at')
    op.drop_column('announcement', 'publish_date')
    op.drop_column('announcement', 'is_published')
    op.drop_column('announcement', 'requires_coupon')
    
    # Revert the description column to original length
    op.alter_column('announcement', 'description',
               existing_type=sqlmodel.sql.sqltypes.AutoString(length=5000),
               type_=sa.VARCHAR(length=1000),
               existing_nullable=True)
    
    # Revert the category column to nullable
    op.alter_column('announcement', 'category',
               existing_type=sa.VARCHAR(length=100),
               nullable=True)
    
    # Revert the created_date column type
    op.alter_column('announcement', 'created_date',
               existing_type=sa.DateTime(),
               type_=postgresql.TIMESTAMP(timezone=True),
               nullable=False,
               existing_server_default=sa.text('now()'))
    
    # Revert the expiry_date column type
    op.alter_column('announcement', 'expiry_date',
               existing_type=sa.DateTime(),
               type_=postgresql.TIMESTAMP(timezone=True),
               existing_nullable=True)
    
    # Revert the deleted_at column type
    op.alter_column('announcement', 'deleted_at',
               existing_type=sa.DateTime(),
               type_=postgresql.TIMESTAMP(timezone=True),
               existing_nullable=True)