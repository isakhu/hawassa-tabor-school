"""
School Management System - FastAPI Application Entry Point
Run with: uvicorn main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables, engine

# Import all models so they are registered on Base.metadata
# before create_all_tables() is called.  New models must be added here.
import app.models  # noqa: F401  (side-effect import — registers User, etc.)

# Routers
from app.api.routes.auth import router as auth_router
from app.api.routes.students import router as students_router
from app.api.routes.teachers import router as teachers_router
from app.api.routes.classes import router as classes_router
from app.api.routes.attendance import router as attendance_router
from app.api.routes.grades import router as grades_router                                                  
from app.api.routes.dashboard import router as dashboard_router
# ---------------------------------------------------------------------------
# Lifespan  (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables for any model registered on Base
    await create_all_tables()
    yield
    # Shutdown: dispose connection pool cleanly
    await engine.dispose()

# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title="School Management System API",
    description="Backend API for managing students, teachers, classes, grades, and attendance.",
    version="1.0.0",
    lifespan=lifespan,
    # Disable interactive docs in production — enable only in development
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# ---------------------------------------------------------------------------
# CORS middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth_router, prefix="/api/v1")
app.include_router(students_router, prefix="/api/v1")
app.include_router(teachers_router, prefix="/api/v1")
app.include_router(classes_router, prefix="/api/v1")
app.include_router(attendance_router, prefix="/api/v1")
app.include_router(grades_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
# ---------------------------------------------------------------------------
# Root endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Root"])
def read_root() -> dict:
    """API welcome message."""
    return {"message": "School Management System API"}


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    """Liveness probe — confirms the server is running."""
    return {"status": "ok"}


@app.get("/db-health", tags=["Health"])
async def db_health_check() -> dict:
    """
    Verifies that the database engine is reachable.
    Runs a lightweight 'SELECT 1' query against PostgreSQL.
    """
    from sqlalchemy import text
    from app.core.database import AsyncSessionLocal

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        return {"status": "error", "database": "unreachable", "detail": str(exc)}
