#!/bin/bash
set -e

echo "Starting application..."

# Run migrations if DB is available
if [ -n "$POSTGRES_SERVER" ]; then
    echo "Running database migrations..."
    
    # Wait for database to be ready
    python app/backend_pre_start.py
    
    # Run alembic migrations
    alembic upgrade head
    
    # Create initial data
    python app/initial_data.py
    
    echo "Migrations completed!"
fi

# Execute the main command (passed as arguments)
exec "$@"
