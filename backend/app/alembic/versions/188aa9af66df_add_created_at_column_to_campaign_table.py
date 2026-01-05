"""add created_at column to campaign table

Revision ID: 188aa9af66df
Revises: bbdb98e37ad4
Create Date: 2026-01-05 16:47:14.835235

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '188aa9af66df'
down_revision = 'bbdb98e37ad4'
branch_labels = None
depends_on = None


def upgrade():
    # Add created_at column to campaign table
    op.add_column('campaign', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    # Update the column type for start_date and end_date to match the model
    op.alter_column('campaign', 'start_date',
               existing_type=sa.DATE(),
               type_=sa.DateTime(),
               existing_nullable=False)
    op.alter_column('campaign', 'end_date',
               existing_type=sa.DATE(),
               type_=sa.DateTime(),
               existing_nullable=False)


def downgrade():
    # Remove created_at column from campaign table
    op.drop_column('campaign', 'created_at')
    # Revert the column type changes
    op.alter_column('campaign', 'end_date',
               existing_type=sa.DateTime(),
               type_=sa.DATE(),
               existing_nullable=False)
    op.alter_column('campaign', 'start_date',
               existing_type=sa.DateTime(),
               type_=sa.DATE(),
               existing_nullable=False)