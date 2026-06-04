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
# before create_all_tables() is called.
import app.models  # noqa: F401

# Routers
from app.api.routes.auth import router as auth_router
from app.api.routes.students import router as students_router
from app.api.routes.teachers import router as teachers_router
from app.api.routes.classes import router as classes_router
from app.api.routes.attendance import router as attendance_router
from app.api.routes.grades import router as grades_router

# ---------------------------------------------------------------------------
# Admin seeder
# ---------------------------------------------------------------------------

async def seed_admin():
    """
    Creates the default admin account on first launch if it doesn't exist.
    Credentials come from config.py (ADMIN_EMAIL / ADMIN_PASSWORD).
    This is the ONLY way to get into the app on first launch.
    """
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.core.security import get_password_hash
    from app.models.user import User, Role

    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        result = await session.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print(f"✅ Admin already exists: {settings.ADMIN_EMAIL}")
            return

        # Create the admin
        admin = User(
            full_name=settings.ADMIN_FULL_NAME,
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            role=Role.ADMIN,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        print(f"🚀 Default admin created: {settings.ADMIN_EMAIL}")
        print(f"🔑 Password: {settings.ADMIN_PASSWORD}")
        print("⚠️  Change this password after first login!")

# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create all DB tables
    await create_all_tables()
    # 2. Seed default admin if not exists
    await seed_admin()
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
    """Verifies that the database engine is reachable."""
    from sqlalchemy import text
    from app.core.database import AsyncSessionLocal

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        return {"status": "error", "database": "unreachable", "detail": str(exc)}