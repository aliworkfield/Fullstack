# FastCoupon Project - Comprehensive Documentation

## Project Overview
FastCoupon is a modern coupon management system built with a microservices architecture using Docker containers. It features user authentication via Keycloak, a React frontend, and a FastAPI backend with PostgreSQL database.

## Technology Stack Versions

### Backend
- **Python**: 3.10+
- **FastAPI**: >=0.114.2, <1.0.0
- **SQLModel**: >=0.0.21, <1.0.0
- **PostgreSQL**: 17 (via Docker)
- **Keycloak Python Library**: >=3.7.0, <4.0.0
- **PyJWT**: >=2.8.0, <3.0.0
- **python-jose**: >=3.3.0, <4.0.0

### Frontend
- **React**: ^19.1.1
- **React DOM**: ^19.2.1
- **TypeScript**: ^5.9.3
- **Vite**: ^7.2.7
- **TanStack Router**: ^1.131.50
- **TanStack React Query**: ^5.90.12
- **Keycloak JS**: ^25.0.0
- **TailwindCSS**: ^4.1.17

### Infrastructure
- **Keycloak**: 26.0.0 (via Docker)
- **PostgreSQL**: 17 (via Docker)
- **Traefik**: 3.0 (via Docker)
- **Adminer**: Latest (via Docker)
- **Mailcatcher**: Latest (via Docker)

## Service Architecture

### Containers
1. **db** - PostgreSQL 17 database
2. **backend** - FastAPI application
3. **frontend** - React/Vite application
4. **keycloak** - Keycloak 26.0.0 identity server
5. **proxy** - Traefik reverse proxy
6. **adminer** - Database management tool
7. **mailcatcher** - Email testing tool
8. **prestart** - Initialization container

### Port Mapping
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Keycloak Admin**: http://localhost:8082
- **Adminer**: http://localhost:8080
- **Mailcatcher**: http://localhost:1080
- **Traefik Dashboard**: http://localhost:8090

## Authentication Flow

### Keycloak Configuration
- **Realm**: coupon-realm
- **Backend Client**: coupon-backend
- **Frontend Client**: coupon-frontend
- **Authentication Method**: OIDC Authorization Code Flow + PKCE

### User Roles
1. **admin** - Full administrative access
2. **manager** - Management access
3. **user** - Standard user access

## Environment Variables

### Backend (.env)
```
# Domain Configuration
DOMAIN=localhost
FRONTEND_HOST=http://localhost:5173
ENVIRONMENT=local

# Project Configuration
PROJECT_NAME='FastCoupon Project'
STACK_NAME=fastcoupon-project

# Security
SECRET_KEY=changethis
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis

# Database
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changethis

# Keycloak Integration
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=coupon-realm
KEYCLOAK_CLIENT_ID=coupon-backend
KEYCLOAK_CLIENT_SECRET=Yy3DsaD4RRzbvvx80fOTWIAgTLt7yYhi
KEYCLOAK_FRONTEND_CLIENT_ID=coupon-frontend
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
MAILCATCHER_HOST=http://mailcatcher:1080
VITE_KEYCLOAK_URL=http://localhost:8082
VITE_KEYCLOAK_REALM=coupon-realm
VITE_KEYCLOAK_CLIENT_ID=coupon-frontend
```

## API Endpoints

### Authentication
- `POST /api/v1/login/access-token` - Traditional login (deprecated for Keycloak)
- `POST /api/v1/login/test-token` - Test token validity

### User Management
- `GET /api/v1/users/me` - Get current user information
- `DELETE /api/v1/users/me` - Delete current user
- `PATCH /api/v1/users/me` - Update current user
- `PATCH /api/v1/users/me/password` - Update current user password
- `POST /api/v1/users/signup` - Register new user
- `GET /api/v1/users/{user_id}` - Get specific user by ID
- `PATCH /api/v1/users/{user_id}` - Update specific user
- `DELETE /api/v1/users/{user_id}` - Delete specific user

### Items Management
- `GET /api/v1/items/` - List items
- `POST /api/v1/items/` - Create new item
- `GET /api/v1/items/{id}` - Get specific item
- `PUT /api/v1/items/{id}` - Update specific item
- `DELETE /api/v1/items/{id}` - Delete specific item

### Utilities
- `GET /api/v1/utils/health-check/` - Health check endpoint

## Database Schema

### User Model
- **id**: UUID (Primary Key)
- **email**: EmailStr (Unique, Indexed)
- **is_active**: Boolean (Default: True)
- **is_superuser**: Boolean (Default: False)
- **full_name**: String (Optional)
- **keycloak_user_id**: String (Optional, Keycloak integration)

### Item Model
- **id**: UUID (Primary Key)
- **title**: String (Required)
- **description**: String (Optional)
- **owner_id**: UUID (Foreign Key to User)

## Key Features

1. **Role-Based Access Control (RBAC)** - Fine-grained permission system
2. **Single Sign-On (SSO)** - Integrated with Keycloak for centralized authentication
3. **Containerized Deployment** - Easy deployment with Docker Compose
4. **Modern Frontend** - React 19 with TanStack Router and Query
5. **RESTful API** - Well-documented FastAPI backend
6. **Database Migrations** - Alembic integration for schema management
7. **Email Services** - Integrated email functionality with templates
8. **Health Monitoring** - Built-in health check endpoints
9. **Security Best Practices** - JWT tokens, secure headers, CORS protection

## Development Workflow

### Prerequisites
- Docker and Docker Compose
- Node.js (for frontend development)
- Python 3.10+ (for backend development)

### Quick Start
1. Clone the repository
2. Copy `.env.example` to `.env` and configure variables
3. Run `docker-compose up -d`
4. Access the application at http://localhost:5173

### Development Commands
- **Frontend Development**: `npm run dev` in frontend directory
- **Backend Development**: `uvicorn app.main:app --reload` in backend directory
- **Database Migrations**: Use Alembic commands
- **Testing**: Run pytest for backend tests

## Troubleshooting

### Common Issues
1. **Authentication Failures**: Check Keycloak configuration and token validity
2. **Database Connection**: Verify PostgreSQL credentials and connectivity
3. **CORS Errors**: Check frontend and backend CORS configuration
4. **Port Conflicts**: Ensure required ports are available

### Debugging Steps
1. Check container logs: `docker-compose logs <service>`
2. Verify service health: Access health check endpoints
3. Test API endpoints directly with curl or Postman
4. Check environment variables in containers

## Maintenance

### Regular Tasks
- Monitor container health and logs
- Update dependencies periodically
- Backup database regularly
- Rotate secrets and keys

### Updates
- Backend: Update pyproject.toml dependencies
- Frontend: Update package.json dependencies
- Docker: Update image versions in docker-compose.yml
- Keycloak: Update realm configuration as needed