# School Management System

A full-stack web application for managing school operations including students, teachers, classes, attendance, and grades.

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 15 (App Router) + TypeScript    |
| Styling    | Tailwind CSS                            |
| Backend    | FastAPI + Python                        |
| Database   | PostgreSQL                              |
| ORM        | SQLAlchemy (async) + Alembic            |
| Auth       | JWT (access + refresh tokens)           |
| Container  | Docker + Docker Compose                 |

## Project Structure

```
school-management-system/
├── frontend/          # Next.js 15 application
│   ├── app/           # App Router pages and layouts
│   ├── components/    # Reusable UI components
│   ├── lib/           # API client, auth utils, constants
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── middleware.ts  # Route protection middleware
│
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # Route handlers and dependencies
│   │   ├── core/      # Config, security, database setup
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic request/response schemas
│   │   ├── services/  # Business logic layer
│   │   └── utils/     # Helper utilities
│   └── main.py        # Application entry point
│
├── database/
│   ├── migrations/    # Alembic migration scripts
│   └── seed/          # Database seed scripts
│
└── docs/              # Project documentation
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

### Quick Start with Docker
```bash
# 1. Clone the repository
git clone <repo-url>
cd school-management-system

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 3. Start all services
docker-compose up --build
```

### Services
| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |

## User Roles
- **Admin** — Full system access: manage users, classes, reports
- **Teacher** — Manage assigned classes, record attendance and grades
- **Student** — View own grades, attendance, and announcements

## Documentation
- [API Reference](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Architecture Overview](./docs/architecture.md)
