"""Authorization and workflow rules for subject-teacher grade entry."""
from __future__ import annotations

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.academic import TeacherAssignment


async def verify_teacher_assignment(
    session: AsyncSession,
    *,
    teacher_id: uuid.UUID,
    class_id: uuid.UUID,
    subject_id: uuid.UUID,
    academic_year: str,
) -> TeacherAssignment:
    """Return the active assignment or raise ValueError if the teacher is not assigned."""
    result = await session.execute(
        select(TeacherAssignment).where(
            TeacherAssignment.teacher_id == teacher_id,
            TeacherAssignment.class_id == class_id,
            TeacherAssignment.subject_id == subject_id,
            TeacherAssignment.academic_year == academic_year,
            TeacherAssignment.is_active.is_(True),
        )
    )
    assignment = result.scalar_one_or_none()
    if assignment is None:
        raise ValueError("Teacher is not assigned to this class and subject for the academic year")
    return assignment
