"""replace is_superuser with role

Revision ID: 31c9g45f4420
Revises: b2f95d2c6217
Create Date: 2026-01-20 17:42:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = '31c9g45f4420'
down_revision = 'b2f95d2c6217'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add 'role' column as nullable initially to allow data migration
    op.add_column('user', sa.Column('role', sa.String(length=20), nullable=True))
    
    # 2. Migrate data
    # We use sqlmodel/sqlalchemy execute for portability
    # is_superuser = True -> role = 'admin'
    # is_superuser = False -> role = 'user'
    op.execute("UPDATE \"user\" SET role = 'admin' WHERE is_superuser = True")
    op.execute("UPDATE \"user\" SET role = 'user' WHERE is_superuser = False")
    op.execute("UPDATE \"user\" SET role = 'user' WHERE role IS NULL")
    
    # 3. Make 'role' non-nullable
    op.alter_column('user', 'role', nullable=False)
    
    # 4. Drop 'is_superuser' column
    op.drop_column('user', 'is_superuser')


def downgrade():
    # 1. Add 'is_superuser' column
    op.add_column('user', sa.Column('is_superuser', sa.Boolean(), nullable=True))
    
    # 2. Migrate data back
    # role = 'admin' -> is_superuser = True
    # role = 'manager' or 'user' -> is_superuser = False
    op.execute("UPDATE \"user\" SET is_superuser = True WHERE role = 'admin'")
    op.execute("UPDATE \"user\" SET is_superuser = False WHERE role != 'admin'")
    
    # 3. Make 'is_superuser' non-nullable
    op.alter_column('user', 'is_superuser', nullable=False)
    
    # 4. Drop 'role' column
    op.drop_column('user', 'role')
