"""School Management System - FastAPI application entry point."""
from contextlib import asynccontextmanager
import asyncio
import random
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
                existing.full_name = settings.ADMIN_FULL_NAME; changed = True
            if not verify_password(settings.ADMIN_PASSWORD, existing.password_hash):
                existing.password_hash = hash_password(settings.ADMIN_PASSWORD); changed = True
            if changed: await session.commit()
            return
        session.add(User(full_name=settings.ADMIN_FULL_NAME, email=settings.ADMIN_EMAIL, password_hash=hash_password(settings.ADMIN_PASSWORD), role=Role.ADMIN, is_active=True))
        await session.commit()

async def seed_demo_data_task():
    await asyncio.sleep(5)
    try:
        await create_all_tables(); await seed_admin()
    except Exception as exc:
        print(f"Initial database setup failed: {exc}"); return
    if not settings.DEMO_SEED_DATA: return
    from sqlalchemy import select, func
    from app.core.database import AsyncSessionLocal
    from app.core.security import hash_password
    from app.models.user import User, Role
    from app.models.student import Student
    from app.models.teacher import Teacher
    from app.models.grade import Grade, AssessmentType
    from app.models.class_model import SchoolClass, ClassEnrollment
    from app.utils.grading import calculate_grade_letter
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Civics", "ICT"]
    async with AsyncSessionLocal() as session:
        count = await session.scalar(select(func.count(Teacher.id)))
        if (count or 0) < 70:
            for i in range(1, 71):
                user = User(full_name=f"Teacher {i}", email=f"teacher{i}", password_hash=hash_password("password"), role=Role.TEACHER)
                session.add(user); await session.flush()
                session.add(Teacher(user_id=user.id, teacher_number=f"TCH-{i:03d}", subject_specialization=random.choice(subjects)))
            await session.commit()
        teachers = (await session.execute(select(Teacher))).scalars().all()
        if not teachers: return
        student_count = await session.scalar(select(func.count(Student.id)))
        if (student_count or 0) >= 1500: return
        grades_config = {9: ("ABCDE", 60), 10: ("ABCDE", 80), 11: ("ABCDE", 80), 12: ("ABCDE", 80)}
        for grade, (sections, per_section) in grades_config.items():
            for section in sections:
                section_info = []
                for subject in subjects:
                    teacher = random.choice(teachers)
                    school_class = SchoolClass(class_name=f"Grade {grade}{section} - {subject}", grade_level=str(grade), section=section, teacher_id=teacher.id, academic_year="2024-2025")
                    session.add(school_class); await session.flush(); section_info.append((school_class.id, teacher.user_id))
                for i in range(1, per_section + 1):
                    username = f"{grade}th{section}{i}"
                    user = User(full_name=f"Student {username}", email=username, password_hash=hash_password(str(i)), role=Role.STUDENT)
                    session.add(user); await session.flush()
                    student = Student(user_id=user.id, student_number=f"STU-{username}", grade_level=str(grade), section=section)
                    session.add(student); await session.flush()
                    for class_id, teacher_user_id in section_info:
                        session.add(ClassEnrollment(class_id=class_id, student_id=student.id))
                        score = round(random.uniform(45, 100), 2)
                        session.add(Grade(student_id=student.id, class_id=class_id, graded_by=teacher_user_id, assessment_type=AssessmentType.EXAM, term="Term 1", score=score, max_score=100, grade_letter=calculate_grade_letter(score)))
                await session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(seed_demo_data_task())
    yield
    await engine.dispose()

app = FastAPI(title="School Management System API", description="Backend API for students, teachers, classes, grades, attendance, and academic administration.", version="1.0.0", lifespan=lifespan, docs_url="/docs" if not settings.is_production else None, redoc_url="/redoc" if not settings.is_production else None)
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins_list, allow_credentials=True, allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allow_headers=["Authorization", "Content-Type"])
for router in (auth_router, students_router, teachers_router, classes_router, attendance_router, grades_router, academic_router, grade_workflow_router, teacher_dashboard_router):
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
        async with AsyncSessionLocal() as session: await session.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception: raise HTTPException(status_code=503, detail="Database is unavailable")
