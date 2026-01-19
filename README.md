# My Awesome Project

A modern full-stack coupon management application built with FastAPI and React.

## Project Structure

```
├── backend/           # FastAPI backend with PostgreSQL
│   ├── app/          # Application code
│   │   ├── api/      # API routes
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── tests/        # Backend tests
├── frontend/          # React frontend with Vite
│   ├── src/          # Source code
│   │   ├── components/ # Reusable components
│   │   ├── routes/   # Page routes
│   │   └── client/   # API client
│   └── tests/        # E2E tests
└── src/routes/_layout/ # Additional routes
```

## Technologies Used

### Backend
- **Python 3.12+**
- **FastAPI** - High-performance web framework
- **SQLModel** - SQL database modeling
- **PostgreSQL** - Relational database
- **Alembic** - Database migration tool
- **JWT Authentication** - Secure authentication

### Frontend
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Pre-built component library
- **TanStack Query** - Server state management
- **i18next** - Internationalization

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Keycloak** - Identity management
- **Traefik** - Reverse proxy/load balancer

## Features

- User authentication and role management
- Campaign management system
- Coupon generation and redemption
- Announcement system
- Admin dashboard
- Multi-language support (English/Turkish)
- Responsive design

## Setup Instructions

1. Clone the repository
2. Copy `.env.example` to `.env` and configure environment variables
3. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Key Components

- **Authentication**: Keycloak-based authentication with JWT tokens
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API**: RESTful API with automatic OpenAPI documentation
- **Frontend**: React with TypeScript and modern UI components
- **Testing**: Pytest for backend, Playwright for E2E tests