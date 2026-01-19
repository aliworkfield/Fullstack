#!/bin/bash

# Production Deployment Script for FastCoupon Application

set -e  # Exit on any error

echo "🚀 Starting FastCoupon Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root (optional, depending on your setup)
if [[ $EUID -eq 0 ]]; then
   echo -e "${YELLOW}Warning: Running as root${NC}"
fi

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}❌ .env.production file not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to backup current deployment
backup_current_deployment() {
    echo -e "${YELLOW}📦 Creating backup...${NC}"
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_DIR="backups/$TIMESTAMP"
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if it's local
    if docker ps | grep -q "db"; then
        echo "Backing up database..."
        docker exec db pg_dump -U postgres app > "$BACKUP_DIR/db_backup.sql"
    fi
    
    # Backup current environment
    cp .env.production "$BACKUP_DIR/env.backup"
    
    echo -e "${GREEN}✅ Backup created at $BACKUP_DIR${NC}"
}

# Function to build and deploy
deploy_application() {
    echo -e "${YELLOW}🏗️ Building and deploying application...${NC}"
    
    # Load production environment
    export $(grep -v '^#' .env.production | xargs)
    
    # Create necessary networks
    echo "Creating Docker networks..."
    docker network create traefik-public 2>/dev/null || true
    
    # Build images
    echo "Building Docker images..."
    docker-compose -f docker-compose.yml -f docker-compose.traefik.yml build --no-cache
    
    # Stop existing containers
    echo "Stopping existing containers..."
    docker-compose -f docker-compose.yml -f docker-compose.traefik.yml down
    
    # Deploy with production configuration
    echo "Deploying application..."
    docker-compose -f docker-compose.yml -f docker-compose.traefik.yml --env-file .env.production up -d
    
    echo -e "${GREEN}✅ Application deployed successfully${NC}"
}

# Function to run health checks
run_health_checks() {
    echo -e "${YELLOW}🩺 Running health checks...${NC}"
    
    # Wait for services to start
    echo "Waiting for services to become healthy..."
    sleep 30
    
    # Check if services are running
    SERVICES=("db" "backend" "frontend" "keycloak" "traefik")
    
    for service in "${SERVICES[@]}"; do
        if docker-compose -f docker-compose.yml -f docker-compose.traefik.yml ps | grep -q "$service.*Up"; then
            echo -e "${GREEN}✅ $service is running${NC}"
        else
            echo -e "${RED}❌ $service is not running properly${NC}"
        fi
    done
    
    # Check backend health endpoint
    echo "Checking backend health..."
    sleep 10
    if curl -f http://localhost:8000/api/v1/utils/health-check/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
}

# Function to display deployment info
display_deployment_info() {
    echo -e "${GREEN}🎉 Deployment Summary${NC}"
    echo "==========================="
    echo "Frontend: https://dashboard.$DOMAIN"
    echo "Backend API: https://api.$DOMAIN" 
    echo "Keycloak: https://keycloak.$DOMAIN"
    echo "Traefik Dashboard: https://traefik.$DOMAIN"
    echo ""
    echo "Admin Credentials:"
    echo "Username: $FIRST_SUPERUSER"
    echo "Password: [Your configured password]"
    echo ""
    echo "Next Steps:"
    echo "1. Configure DNS records for your domain"
    echo "2. Set up SSL certificates (Let's Encrypt)"
    echo "3. Configure monitoring and alerting"
    echo "4. Set up automated backups"
    echo "5. Review security configurations"
}

# Main deployment process
main() {
    check_prerequisites
    backup_current_deployment
    deploy_application
    run_health_checks
    display_deployment_info
    
    echo -e "${GREEN}🚀 Production deployment completed successfully!${NC}"
}

# Run main function
main "$@"