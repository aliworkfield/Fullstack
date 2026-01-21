import os
from alembic.config import Config
from alembic import command

# Change to the correct directory
os.chdir('/app')

# Run the migration
alembic_cfg = Config('alembic.ini')
command.upgrade(alembic_cfg, 'head')