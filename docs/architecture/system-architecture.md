# EduCore System Architecture

EduCore follows a layered full-stack architecture.

```text
Next.js / React frontend
        |
        | HTTP / JSON
        v
FastAPI REST API
        |
        | SQLAlchemy Async ORM
        v
PostgreSQL
```

## Frontend Layer

The frontend is responsible for navigation, forms, dashboards, client-side state, user feedback, and API consumption.

## API Layer

FastAPI exposes versioned REST endpoints under `/api/v1`. Route modules separate authentication, students, teachers, classes, attendance, and grades.

## Security Layer

Authentication uses JWT-based access control with password hashing. Role-aware authorization protects privileged operations.

## Data Layer

SQLAlchemy provides the asynchronous ORM layer over PostgreSQL. Relationships represent users, students, teachers, classes, attendance, and grades.

## Configuration

Environment variables control database access, JWT configuration, administrator setup, CORS, frontend API configuration, and optional demo-data seeding.

## Deployment Principle

Development conveniences such as demo-data generation are explicitly separated from production startup. This reduces operational risk and makes deployment configuration reproducible.
