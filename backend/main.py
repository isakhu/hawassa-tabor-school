"""
School Management System - FastAPI Application Entry Point
Run with: uvicorn main:app --reload
"""

from contextlib import asynccontextmanager
import random

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
    from app.core.security import hash_password
    from app.models.user import User, Role

    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        result = await session.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            # Update admin to match current config (allows password/name changes)
            existing_admin.full_name = settings.ADMIN_FULL_NAME
            existing_admin.password_hash = hash_password(settings.ADMIN_PASSWORD)
            await session.commit()
            print(f"✅ Admin credentials synced: {settings.ADMIN_EMAIL}")
            return

        # Create the admin
        admin = User(
            full_name=settings.ADMIN_FULL_NAME,
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role=Role.ADMIN,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        print(f"🚀 Default admin created: {settings.ADMIN_EMAIL}")

async def seed_demo_data():
    """
    Populates the database with 70 teachers, 9 subjects per class,
    1500 students, and random grades for every student/subject.
    """
    from sqlalchemy import select, func
    from app.core.database import AsyncSessionLocal
    from app.core.security import hash_password
    from app.models.user import User, Role
    from app.models.student import Student
    from app.models.teacher import Teacher
    from app.models.grade import Grade, AssessmentType
    from app.models.class_model import SchoolClass, ClassEnrollment
    from app.utils.grading import calculate_grade_letter

    SUBJECTS = [
        "Mathematics", "Physics", "Chemistry", "Biology", 
        "English", "History", "Geography", "Civics", "ICT"
    ]

    async with AsyncSessionLocal() as session:
        # 1. Seed 70 Teachers
        existing_teachers = await session.execute(select(func.count(Teacher.id)))
        if existing_teachers.scalar() < 70:
            print("⏳ Seeding 70 demo teachers...")
            for i in range(1, 71):
                username = f"teacher{i}"
                user = User(
                    full_name=f"Teacher {i}",
                    email=username,
                    password_hash=hash_password("password"),
                    role=Role.TEACHER
                )
                session.add(user)
                await session.flush()
                
                teacher = Teacher(
                    user_id=user.id,
                    teacher_number=f"TCH-{i:03d}",
                    subject_specialization=random.choice(SUBJECTS)
                )
                session.add(teacher)
            await session.commit()
            print("🚀 70 teachers created.")

        # Fetch all teachers to assign to classes
        teacher_result = await session.execute(select(Teacher))
        teachers = teacher_result.scalars().all()

        # Check if we already have students seeded
        existing_count = await session.execute(select(func.count(Student.id)))
        if existing_count.scalar() >= 1500:
            print("✅ Demo students already seeded.")
            return

        print("⏳ Seeding 1500 students and 13,500 grade records... please wait.")
        
        grades_config = {
            9: {"sections": ["A", "B", "C", "D", "E"], "per_section": 60},
            10: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
            11: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
            12: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
        }

        for grade, config in grades_config.items():
            for section_letter in config["sections"]:
                # 1. Create 9 classes (one for each subject) for this section
                section_classes = []
                for subject in SUBJECTS:
                    class_name = f"Grade {grade}{section_letter} - {subject}"
                    # Randomly assign a teacher
                    assigned_teacher = random.choice(teachers)
                    
                    school_class = SchoolClass(
                        class_name=class_name,
                        grade_level=str(grade),
                        section=section_letter,
                        teacher_id=assigned_teacher.id,
                        academic_year="2024-2025"
                    )
                    session.add(school_class)
                    section_classes.append(school_class)
                
                await session.flush()

                # 2. Create Students for this section
                for i in range(1, config["per_section"] + 1):
                    username = f"{grade}th{section_letter}{i}"
                    password = str(i)
                    
                    user = User(
                        full_name=f"Student {username}",
                        email=username,
                        password_hash=hash_password(password),
                        role=Role.STUDENT
                    )
                    session.add(user)
                    await session.flush() # get user.id

                    student = Student(user_id=user.id, student_number=f"STU-{username}")
                    session.add(student)
                    await session.flush() # get student.id

                    # Enroll in ALL 9 subject classes and generate random grades
                    for s_class in section_classes:
                        enrollment = ClassEnrollment(class_id=s_class.id, student_id=student.id)
                        session.add(enrollment)
                        
                        # Random grade between 45 and 100
                        score = random.uniform(45, 100)
                        pct = round(score, 2)
                        
                        grade_record = Grade(
                            student_id=student.id,
                            class_id=s_class.id,
                            graded_by=s_class.teacher.user_id if s_class.teacher else None,
                            assessment_type=AssessmentType.EXAM,
                            term="Term 1",
                            score=pct,
                            max_score=100,
                            grade_letter=calculate_grade_letter(pct),
                            comments="Automatic demo seed"
                        )
                        session.add(grade_record)

        await session.commit()
        print("🚀 Demo data seeding complete: 1500 students, 70 teachers, and 13,500 grades.")

# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create all DB tables
    await create_all_tables()
    # 2. Seed default admin if not exists
    await seed_admin()
    # 3. Seed expanded demo data (Teachers, Students, Grades)
    await seed_demo_data()
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