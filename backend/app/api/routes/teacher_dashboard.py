"""Teacher-scoped dashboard endpoints.

A teacher only sees classes and subjects explicitly assigned by the manager.
"""
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.academic import TeacherAssignment
from app.models.teacher import Teacher
from app.models.user import Role, User

router = APIRouter(prefix="/teacher-dashboard", tags=["Teacher Dashboard"])


async def _teacher_profile(db: AsyncSession, user: User) -> Teacher:
    if user.role != Role.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher access required.")
    result = await db.execute(select(Teacher).where(Teacher.user_id == user.id))
    teacher = result.scalar_one_or_none()
    if teacher is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher profile not found.")
    return teacher


@router.get("/assignments")
async def my_assignments(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Return only the active class/subject assignments belonging to the logged-in teacher."""
    teacher = await _teacher_profile(db, current_user)
    result = await db.execute(
        select(TeacherAssignment)
        .where(TeacherAssignment.teacher_id == teacher.id, TeacherAssignment.is_active.is_(True))
        .options(selectinload(TeacherAssignment.school_class), selectinload(TeacherAssignment.subject))
        .order_by(TeacherAssignment.academic_year.desc())
    )
    assignments = result.scalars().all()
    return [
        {
            "id": assignment.id,
            "academic_year": assignment.academic_year,
            "class_id": assignment.class_id,
            "class_name": assignment.school_class.class_name,
            "grade_level": assignment.school_class.grade_level,
            "section": assignment.school_class.section,
            "subject_id": assignment.subject_id,
            "subject_name": assignment.subject.name,
            "is_class_head": assignment.school_class.class_head_id == teacher.id,
        }
        for assignment in assignments
    ]
