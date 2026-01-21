import os
import sys
from alembic.config import Config
from alembic import command

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# Change to the app directory
os.chdir(os.path.join(os.path.dirname(__file__), 'app'))

# Run the migration
alembic_cfg = Config('alembic.ini')
command.upgrade(alembic_cfg, 'head')