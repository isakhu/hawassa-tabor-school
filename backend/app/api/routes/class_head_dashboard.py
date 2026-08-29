"""Class-head scoped dashboard and student registration support."""
from typing import Annotated
import secrets
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.security import hash_password
from app.models.class_model import SchoolClass, ClassEnrollment
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import Role, User

router = APIRouter(prefix="/class-head", tags=["Class Head"])

class StudentRegistration(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    student_number: str = Field(min_length=2, max_length=50)
    email: str | None = Field(default=None, max_length=255)

async def _head_classes(db: AsyncSession, user: User) -> tuple[Teacher, list[SchoolClass]]:
    if user.role != Role.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher access required.")
    teacher = (await db.execute(select(Teacher).where(Teacher.user_id == user.id))).scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")
    result = await db.execute(select(SchoolClass).where(SchoolClass.class_head_id == teacher.id, SchoolClass.is_active.is_(True)))
    return teacher, list(result.scalars().all())

@router.get("/classes")
async def my_classes(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    _, classes = await _head_classes(db, current_user)
    return [{"id": c.id, "class_name": c.class_name, "grade_level": c.grade_level, "section": c.section, "academic_year": c.academic_year} for c in classes]

@router.get("/classes/{class_id}/students")
async def class_students(class_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    _, classes = await _head_classes(db, current_user)
    school_class = next((c for c in classes if c.id == class_id), None)
    if school_class is None:
        raise HTTPException(status_code=403, detail="You are not the class head for this class.")
    result = await db.execute(select(Student).join(ClassEnrollment, ClassEnrollment.student_id == Student.id).where(ClassEnrollment.class_id == class_id))
    students = result.scalars().all()
    return [{"id": s.id, "student_number": s.student_number, "grade_level": s.grade_level, "section": s.section, "full_name": s.user.full_name if getattr(s, "user", None) else None} for s in students]

@router.post("/classes/{class_id}/students", status_code=201)
async def register_student(class_id: uuid.UUID, payload: StudentRegistration, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    _, classes = await _head_classes(db, current_user)
    school_class = next((c for c in classes if c.id == class_id), None)
    if school_class is None:
        raise HTTPException(status_code=403, detail="You are not the class head for this class.")
    existing = await db.execute(select(Student).where(Student.student_number == payload.student_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Student number already exists.")
    login_code = secrets.token_urlsafe(6)[:8]
    login_id = payload.student_number
    user = User(full_name=payload.full_name, email=payload.email or f"{login_id}@student.local", password_hash=hash_password(login_code), role=Role.STUDENT, is_active=True)
    db.add(user)
    await db.flush()
    student = Student(user_id=user.id, student_number=payload.student_number, grade_level=school_class.grade_level, section=school_class.section)
    db.add(student)
    await db.flush()
    db.add(ClassEnrollment(class_id=class_id, student_id=student.id))
    await db.commit()
    return {"student_id": student.id, "student_number": student.student_number, "login_id": login_id, "login_code": login_code, "message": "Save these credentials securely; the login code is shown only once."}
