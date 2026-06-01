# System Architecture

## Overview
The School Management System follows a **decoupled full-stack architecture**
with a Next.js frontend and a FastAPI backend communicating over a REST API.

## Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│              Next.js 15 (App Router + TypeScript)        │
│              Tailwind CSS + React Query                  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST API (JSON)
                         │ JWT Bearer Token
┌────────────────────────▼────────────────────────────────┐
│                   FastAPI Backend                        │
│         Routes → Dependencies → Services → Models       │
│              Pydantic validation + JWT auth             │
└────────────────────────┬────────────────────────────────┘
                         │ SQLAlchemy (async)
┌────────────────────────▼────────────────────────────────┐
│                    PostgreSQL Database                   │
│              Managed via Alembic migrations             │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions
- **Layered backend**: Routes → Services → Models (separation of concerns)
- **JWT authentication**: Stateless, role-based access control
- **Async I/O**: FastAPI + SQLAlchemy async for high concurrency
- **Type safety**: TypeScript on frontend, Pydantic on backend
- **Containerized**: Docker Compose for local development parity

<!-- Deployment architecture will be documented during implementation -->
