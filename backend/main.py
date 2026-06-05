"""
School Management System - FastAPI Application Entry Point
Run with: uvicorn main:app --reload
"""

from contextlib import asynccontextmanager
import random
import asyncio

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
    from app.core.security import hash_password, verify_password
    from app.models.user import User, Role

    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        result = await session.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            # Only update if there is a discrepancy to avoid redundant DB writes on every startup
            updated = False
            if existing_admin.full_name != settings.ADMIN_FULL_NAME:
                existing_admin.full_name = settings.ADMIN_FULL_NAME
                updated = True
            
            if not verify_password(settings.ADMIN_PASSWORD, existing_admin.password_hash):
                existing_admin.password_hash = hash_password(settings.ADMIN_PASSWORD)
                updated = True
            
            if updated:
                await session.commit()
                print(f"✅ Admin credentials updated: {settings.ADMIN_EMAIL}")
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

async def seed_demo_data_task():
    """
    Populates the database with 70 teachers, 9 subjects per class,
    1500 students, and random grades for every student/subject.
    """
    # Give Uvicorn time to bind the port and signal Render before we hit the DB
    await asyncio.sleep(5)
    
    try:
        await create_all_tables()
        await seed_admin()
    except Exception as e:
        print(f"❌ Initial setup failed: {e}")
        return

    print("⏳ Starting demo data seeding in background...")
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
            print("✅ Demo data already exists.")
            return

        print("⏳ Seeding 1500 students and 13,500 grades... (Background)")
        
        grades_config = {
            9: {"sections": ["A", "B", "C", "D", "E"], "per_section": 60},
            10: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
            11: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
            12: {"sections": ["A", "B", "C", "D", "E"], "per_section": 80},
        }

        for grade, config in grades_config.items():
            for section_letter in config["sections"]:
                # 1. Create 9 classes (one for each subject) for this section
                section_info = [] # Store (class_id, teacher_user_id)
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
                    await session.flush()
                    section_info.append((school_class.id, assigned_teacher.user_id))
                
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

                    student = Student(
                        user_id=user.id,
                        student_number=f"STU-{username}",
                        grade_level=str(grade),  # Ensure this is passed as string
                        section=str(section_letter)
                    )
                    session.add(student)
                    await session.flush()

                    # Enroll in ALL 9 subject classes and generate random grades
                    grade_records = []
                    for s_class_id, s_teacher_uid in section_info:
                        enrollment = ClassEnrollment(class_id=s_class_id, student_id=student.id)
                        session.add(enrollment)
                        
                        # Random grade between 45 and 100
                        score = random.uniform(45, 100)
                        pct = round(score, 2)
                        
                        grade_records.append(
                            Grade(
                                student_id=student.id,
                                class_id=s_class_id,
                                graded_by=s_teacher_uid,
                                assessment_type=AssessmentType.EXAM,
                                term="Term 1",
                                score=pct,
                                max_score=100,
                                grade_letter=calculate_grade_letter(pct),
                                comments="Automatic demo seed"
                            )
                        )
                    session.add_all(grade_records)
                
                # Commit every section to keep memory usage low
                await session.commit()
    print("🚀 Demo data seeding complete.")

# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Move ALL DB initialization to a background task. 
    # This allows the lifespan to yield immediately so Uvicorn 
    # can bind the port and satisfy Render's port scan.
    asyncio.create_task(seed_demo_data_task())
    yield
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