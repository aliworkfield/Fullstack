#! /usr/bin/env bash

set -e
set -x

# Let the DB start
python app/backend_pre_start.py

# Check for multiple heads and resolve them if needed
echo "Checking alembic heads..."
alembic heads

# If there are multiple heads, merge them
if alembic heads | grep -q "Multiple"; then
    echo "Multiple heads detected, attempting to merge..."
    alembic merge -m "Merge multiple heads"
fi

# Run migrations
alembic upgrade head

# Create initial data in DB
python app/initial_data.py