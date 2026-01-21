#!/bin/bash

# Deployment script for separated backend, frontend, and database components
set -e  # Exit on any error

echo "Starting deployment of separated components..."

# Function to deploy database
deploy_db() {
    echo "Deploying database..."
    cd db
    docker-compose -f docker-compose.db.yml up -d
    echo "Waiting for database to be ready..."
    sleep 30
    docker-compose -f docker-compose.db.yml ps
    cd ..
    echo "Database deployed successfully!"
}

# Function to deploy backend
deploy_backend() {
    echo "Deploying backend..."
    cd backend
    docker-compose -f docker-compose.backend.yml up -d
    cd ..
    echo "Backend deployed successfully!"
}

# Function to deploy frontend
deploy_frontend() {
    echo "Deploying frontend..."
    cd frontend
    docker-compose -f docker-compose.frontend.yml up -d
    cd ..
    echo "Frontend deployed successfully!"
}

# Function to deploy all components
deploy_all() {
    deploy_db
    deploy_backend
    deploy_frontend
    echo "All components deployed successfully!"
}

# Function to stop all components
stop_all() {
    echo "Stopping all components..."
    cd db
    docker-compose -f docker-compose.db.yml down
    cd ../backend
    docker-compose -f docker-compose.backend.yml down
    cd ../frontend
    docker-compose -f docker-compose.frontend.yml down
    cd ..
    echo "All components stopped!"
}

# Function to show status
show_status() {
    echo "Status of database:"
    cd db
    docker-compose -f docker-compose.db.yml ps
    cd ../backend
    echo "Status of backend:"
    docker-compose -f docker-compose.backend.yml ps
    cd ../frontend
    echo "Status of frontend:"
    docker-compose -f docker-compose.frontend.yml ps
    cd ..
}

# Parse command line arguments
case "$1" in
    db)
        deploy_db
        ;;
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_all
        ;;
    stop)
        stop_all
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {db|backend|frontend|all|stop|status}"
        echo "  db       - Deploy only the database"
        echo "  backend  - Deploy only the backend"
        echo "  frontend - Deploy only the frontend"
        echo "  all      - Deploy all components in order"
        echo "  stop     - Stop all components"
        echo "  status   - Show status of all components"
        exit 1
        ;;
esac

echo "Deployment process completed!"