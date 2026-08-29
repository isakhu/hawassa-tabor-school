"""School Management System - FastAPI application entry point."""
from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables, engine
import app.models  # noqa: F401
from app.api.routes.auth import router as auth_router
from app.api.routes.students import router as students_router
from app.api.routes.teachers import router as teachers_router
from app.api.routes.classes import router as classes_router
from app.api.routes.attendance import router as attendance_router
from app.api.routes.grades import router as grades_router
from app.api.routes.academic import router as academic_router
from app.api.routes.grade_workflow import router as grade_workflow_router
from app.api.routes.teacher_dashboard import router as teacher_dashboard_router
from app.api.routes.class_head_dashboard import router as class_head_dashboard_router
from app.api.routes.student_portal import router as student_portal_router
from app.api.routes.class_head_attendance import router as class_head_attendance_router
from app.api.routes.grade_submission import router as grade_submission_router


async def seed_admin():
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.core.security import hash_password, verify_password
    from app.models.user import User, Role

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
        existing = result.scalar_one_or_none()
        if existing:
            changed = False
            if existing.full_name != settings.ADMIN_FULL_NAME:
                existing.full_name = settings.ADMIN_FULL_NAME
                changed = True
            if not verify_password(settings.ADMIN_PASSWORD, existing.password_hash):
                existing.password_hash = hash_password(settings.ADMIN_PASSWORD)
                changed = True
            if changed:
                await session.commit()
            return

        session.add(
            User(
                full_name=settings.ADMIN_FULL_NAME,
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                role=Role.ADMIN,
                is_active=True,
            )
        )
        await session.commit()


async def seed_demo_data_task():
    await asyncio.sleep(5)
    try:
        await create_all_tables()
        await seed_admin()
    except Exception as exc:
        print(f"Initial database setup failed: {exc}")
        return
    if not settings.DEMO_SEED_DATA:
        return


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(seed_demo_data_task())
    yield
    await engine.dispose()


app = FastAPI(
    title="School Management System API",
    description="Backend API for students, teachers, classes, grades, attendance, and academic administration.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# Keep explicit configured origins for local/custom deployments, and also
# support Vercel preview/production deployments without requiring a backend
# code change for every new Vercel deployment URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=r"^https://([a-zA-Z0-9-]+\.)?vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

for router in (
    auth_router,
    students_router,
    teachers_router,
    classes_router,
    attendance_router,
    grades_router,
    academic_router,
    grade_workflow_router,
    teacher_dashboard_router,
    class_head_dashboard_router,
    student_portal_router,
    class_head_attendance_router,
    grade_submission_router,
):
    app.include_router(router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def read_root() -> dict:
    return {"message": "School Management System API", "version": app.version}


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/db-health", tags=["Health"])
async def db_health_check() -> dict:
    from sqlalchemy import text
    from app.core.database import AsyncSessionLocal

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database is unavailable")
