"""Student-scoped portal endpoints."""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User, Role
from app.models.student import Student
from app.models.class_model import ClassEnrollment, SchoolClass
from app.models.grade import Grade

router = APIRouter(prefix="/student-portal", tags=["Student Portal"])

async def _student(db: AsyncSession, user: User) -> Student:
    if user.role != Role.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required.")
    result = await db.execute(select(Student).where(Student.user_id == user.id).options(selectinload(Student.user)))
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    return student

@router.get("/me")
async def profile(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    student = await _student(db, current_user)
    result = await db.execute(select(ClassEnrollment).where(ClassEnrollment.student_id == student.id).options(selectinload(ClassEnrollment.school_class)))
    enrollments = result.scalars().all()
    return {"id": student.id, "student_number": student.student_number, "full_name": student.user.full_name, "grade_level": student.grade_level, "section": student.section, "classes": [{"id": e.school_class.id, "name": e.school_class.class_name, "academic_year": e.school_class.academic_year} for e in enrollments]}

@router.get("/grades")
async def grades(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    student = await _student(db, current_user)
    result = await db.execute(select(Grade).where(Grade.student_id == student.id).order_by(Grade.created_at.desc()))
    return result.scalars().all()
