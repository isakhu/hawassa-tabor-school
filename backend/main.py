"""
School Management System - FastAPI Application Entry Point
Run with: uvicorn main:app --reload
"""

from contextlib import asynccontextmanager
import random
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


async def seed_admin():
    """Create or synchronize the configured initial administrator account."""
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.core.security import hash_password, verify_password
    from app.models.user import User, Role

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            updated = False
            if existing_admin.full_name != settings.ADMIN_FULL_NAME:
                existing_admin.full_name = settings.ADMIN_FULL_NAME
                updated = True
            if not verify_password(settings.ADMIN_PASSWORD, existing_admin.password_hash):
                existing_admin.password_hash = hash_password(settings.ADMIN_PASSWORD)
                updated = True
            if updated:
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
        print(f"Initial admin created: {settings.ADMIN_EMAIL}")


async def seed_demo_data_task():
    """Populate optional local/demo data when DEMO_SEED_DATA is enabled."""
    await asyncio.sleep(5)

    try:
        await create_all_tables()
        await seed_admin()
    except Exception as exc:
        print(f"Initial database setup failed: {exc}")
        return

    if not settings.DEMO_SEED_DATA:
        print("Demo data seeding disabled.")
        return

    print("Starting optional demo data seeding...")
    from sqlalchemy import select, func
    from app.core.database import AsyncSessionLocal
    from app.core.security import hash_password
    from app.models.user import User, Role
    from app.models.student import Student
    from app.models.teacher import Teacher
    from app.models.grade import Grade, AssessmentType
    from app.models.class_model import SchoolClass, ClassEnrollment
    from app.utils.grading import calculate_grade_letter

    subjects = [
        "Mathematics", "Physics", "Chemistry", "Biology",
        "English", "History", "Geography", "Civics", "ICT"
    ]

    async with AsyncSessionLocal() as session:
        existing_teachers = await session.execute(select(func.count(Teacher.id)))
        if existing_teachers.scalar() < 70:
            for i in range(1, 71):
                user = User(
                    full_name=f"Teacher {i}",
                    email=f"teacher{i}",
                    password_hash=hash_password("password"),
                    role=Role.TEACHER,
                )
                session.add(user)
                await session.flush()
                session.add(
                    Teacher(
                        user_id=user.id,
                        teacher_number=f"TCH-{i:03d}",
                        subject_specialization=random.choice(subjects),
                    )
                )
            await session.commit()

        teacher_result = await session.execute(select(Teacher))
        teachers = teacher_result.scalars().all()
        if not teachers:
            print("Demo seed skipped: no teachers available.")
            return

        existing_students = await session.execute(select(func.count(Student.id)))
        if existing_students.scalar() >= 1500:
            print("Demo data already exists.")
            return

        grades_config = {
            9: {"sections": ["A", "B", "C", "D", "E"], "per_section": 60},
            10: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
            11: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
            12: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
        }

        for grade, config in grades_config.items():
            for section_letter in config["sections"]:
                section_info = []
                for subject in subjects:
                    assigned_teacher = random.choice(teachers)
                    school_class = SchoolClass(
                        class_name=f"Grade {grade}{section_letter} - {subject}",
                        grade_level=str(grade),
                        section=section_letter,
                        teacher_id=assigned_teacher.id,
                        academic_year="2024-2025",
                    )
                    session.add(school_class)
                    await session.flush()
                    section_info.append((school_class.id, assigned_teacher.user_id))

                for i in range(1, config["per_section"] + 1):
                    username = f"{grade}th{section_letter}{i}"
                    user = User(
                        full_name=f"Student {username}",
                        email=username,
                        password_hash=hash_password(str(i)),
                        role=Role.STUDENT,
                    )
                    session.add(user)
                    await session.flush()

                    student = Student(
                        user_id=user.id,
                        student_number=f"STU-{username}",
                        grade_level=str(grade),
                        section=section_letter,
                    )
                    session.add(student)
                    await session.flush()

                    grade_records = []
                    for class_id, teacher_user_id in section_info:
                        session.add(ClassEnrollment(class_id=class_id, student_id=student.id))
                        score = round(random.uniform(45, 100), 2)
                        grade_records.append(
                            Grade(
                                student_id=student.id,
                                class_id=class_id,
                                graded_by=teacher_user_id,
                                assessment_type=AssessmentType.EXAM,
                                term="Term 1",
                                score=score,
                                max_score=100,
                                grade_letter=calculate_grade_letter(score),
                                comments="Automatic demo seed",
                            )
                        )
                    session.add_all(grade_records)

                await session.commit()

    print("Demo data seeding complete.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(seed_demo_data_task())
    yield
    await engine.dispose()


app = FastAPI(
    title="School Management System API",
    description="Backend API for managing students, teachers, classes, grades, and attendance.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(students_router, prefix="/api/v1")
app.include_router(teachers_router, prefix="/api/v1")
app.include_router(classes_router, prefix="/api/v1")
app.include_router(attendance_router, prefix="/api/v1")
app.include_router(grades_router, prefix="/api/v1")


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
