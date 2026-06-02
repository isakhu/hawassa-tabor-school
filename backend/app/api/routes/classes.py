"""
Class CRUD routes.

Access matrix:
  POST   /classes                          → ADMIN only
  GET    /classes                          → ADMIN, TEACHER (own classes), STUDENT (own class)
  GET    /classes/{id}                     → ADMIN, assigned TEACHER, enrolled STUDENT
  PUT    /classes/{id}                     → ADMIN only
  DELETE /classes/{id}                     → ADMIN only
  POST   /classes/{id}/enroll              → ADMIN only
  DELETE /classes/{id}/enroll/{student_id} → ADMIN only
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.class_model import ClassEnrollment, SchoolClass
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import Role, User
from app.schemas.class_schema import (
    ClassCreate,
    ClassDetailResponse,
    ClassResponse,
    ClassUpdate,
    EnrollStudentRequest,
)

router = APIRouter(prefix="/classes", tags=["Classes"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_class_or_404(
    class_id: uuid.UUID,
    db: AsyncSession,
    *,
    load_teacher: bool = False,
    load_enrollments: bool = False,
) -> SchoolClass:
    """Fetch a class by PK, raise 404 if not found."""
    query = select(SchoolClass).where(SchoolClass.id == class_id)
    if load_teacher:
        query = query.options(selectinload(SchoolClass.teacher))
    if load_enrollments:
        query = query.options(selectinload(SchoolClass.enrollments))
    result = await db.execute(query)
    school_class = result.scalar_one_or_none()
    if school_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class {class_id} not found.",
        )
    return school_class


async def _get_teacher_profile(user_id: uuid.UUID, db: AsyncSession) -> Teacher | None:
    """Return the Teacher profile for a given user_id, or None."""
    result = await db.execute(select(Teacher).where(Teacher.user_id == user_id))
    return result.scalar_one_or_none()


async def _get_student_profile(user_id: uuid.UUID, db: AsyncSession) -> Student | None:
    """Return the Student profile for a given user_id, or None."""
    result = await db.execute(select(Student).where(Student.user_id == user_id))
    return result.scalar_one_or_none()


def _build_detail_response(school_class: SchoolClass) -> ClassDetailResponse:
    """Build a ClassDetailResponse including enrolled_student_count."""
    data = ClassDetailResponse.model_validate(school_class)
    data.enrolled_student_count = len(school_class.enrollments)
    return data


# ---------------------------------------------------------------------------
# POST /classes  — ADMIN only
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=ClassResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new class (Admin only)",
)
async def create_class(
    payload: ClassCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> ClassResponse:
    """
    Create a new class. Optionally assign a teacher at creation time.
    The teacher_id must reference an existing Teacher profile.
    """
    # Validate teacher exists if provided
    if payload.teacher_id is not None:
        teacher_check = await db.execute(
            select(Teacher).where(Teacher.id == payload.teacher_id)
        )
        if teacher_check.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found.",
            )

    school_class = SchoolClass(**payload.model_dump())
    db.add(school_class)
    await db.flush()
    await db.refresh(school_class)
    return ClassResponse.model_validate(school_class)


# ---------------------------------------------------------------------------
# GET /classes  — ADMIN (all), TEACHER (assigned), STUDENT (enrolled)
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=list[ClassResponse],
    summary="List classes",
)
async def list_classes(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ClassResponse]:
    """
    Return classes scoped by role:
    - ADMIN    → all classes
    - TEACHER  → only classes where teacher_id matches their profile
    - STUDENT  → only classes they are enrolled in
    """
    if current_user.role == Role.ADMIN:
        result = await db.execute(
            select(SchoolClass).order_by(SchoolClass.grade_level, SchoolClass.section)
        )
        classes = result.scalars().all()

    elif current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            return []
        result = await db.execute(
            select(SchoolClass)
            .where(SchoolClass.teacher_id == teacher.id)
            .order_by(SchoolClass.grade_level, SchoolClass.section)
        )
        classes = result.scalars().all()

    else:  # STUDENT
        student = await _get_student_profile(current_user.id, db)
        if student is None:
            return []
        result = await db.execute(
            select(SchoolClass)
            .join(ClassEnrollment, ClassEnrollment.class_id == SchoolClass.id)
            .where(ClassEnrollment.student_id == student.id)
            .order_by(SchoolClass.grade_level, SchoolClass.section)
        )
        classes = result.scalars().all()

    return [ClassResponse.model_validate(c) for c in classes]


# ---------------------------------------------------------------------------
# GET /classes/{id}  — ADMIN, assigned TEACHER, enrolled STUDENT
# ---------------------------------------------------------------------------

@router.get(
    "/{class_id}",
    response_model=ClassDetailResponse,
    summary="Get full class details",
)
async def get_class(
    class_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ClassDetailResponse:
    """
    Fetch a class with teacher info and enrolled student count.
    - ADMIN        → any class
    - TEACHER      → only their assigned class
    - STUDENT      → only a class they are enrolled in
    """
    school_class = await _get_class_or_404(
        class_id, db, load_teacher=True, load_enrollments=True
    )

    if current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None or school_class.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own assigned classes.",
            )

    elif current_user.role == Role.STUDENT:
        student = await _get_student_profile(current_user.id, db)
        if student is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No student profile found for this account.",
            )
        enrolled = await db.execute(
            select(ClassEnrollment).where(
                ClassEnrollment.class_id == class_id,
                ClassEnrollment.student_id == student.id,
            )
        )
        if enrolled.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not enrolled in this class.",
            )

    return _build_detail_response(school_class)


# ---------------------------------------------------------------------------
# PUT /classes/{id}  — ADMIN only
# ---------------------------------------------------------------------------

@router.put(
    "/{class_id}",
    response_model=ClassResponse,
    summary="Update a class (Admin only)",
)
async def update_class(
    class_id: uuid.UUID,
    payload: ClassUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> ClassResponse:
    """
    Partially update a class. Only fields present in the payload are applied.
    Pass teacher_id=null to unassign the current teacher.
    """
    school_class = await _get_class_or_404(class_id, db)

    # Validate new teacher_id if provided
    update_data = payload.model_dump(exclude_unset=True)
    if "teacher_id" in update_data and update_data["teacher_id"] is not None:
        teacher_check = await db.execute(
            select(Teacher).where(Teacher.id == update_data["teacher_id"])
        )
        if teacher_check.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found.",
            )

    for field, value in update_data.items():
        setattr(school_class, field, value)

    await db.flush()
    await db.refresh(school_class)
    return ClassResponse.model_validate(school_class)


# ---------------------------------------------------------------------------
# DELETE /classes/{id}  — ADMIN only
# ---------------------------------------------------------------------------

@router.delete(
    "/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a class (Admin only)",
)
async def delete_class(
    class_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> None:
    """
    Delete a class and all its enrollment records (cascade).
    Teacher and Student records are NOT deleted.
    """
    school_class = await _get_class_or_404(class_id, db)
    await db.delete(school_class)


# ---------------------------------------------------------------------------
# POST /classes/{id}/enroll  — ADMIN only
# ---------------------------------------------------------------------------

@router.post(
    "/{class_id}/enroll",
    status_code=status.HTTP_201_CREATED,
    summary="Enroll a student into a class (Admin only)",
)
async def enroll_student(
    class_id: uuid.UUID,
    payload: EnrollStudentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> dict:
    """Enroll an existing student into this class."""
    # Class must exist
    await _get_class_or_404(class_id, db)

    # Student must exist
    student_check = await db.execute(
        select(Student).where(Student.id == payload.student_id)
    )
    if student_check.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found.",
        )

    # No duplicate enrollments
    dup = await db.execute(
        select(ClassEnrollment).where(
            ClassEnrollment.class_id == class_id,
            ClassEnrollment.student_id == payload.student_id,
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student is already enrolled in this class.",
        )

    enrollment = ClassEnrollment(class_id=class_id, student_id=payload.student_id)
    db.add(enrollment)
    await db.flush()
    return {"message": "Student enrolled successfully.", "class_id": str(class_id), "student_id": str(payload.student_id)}


# ---------------------------------------------------------------------------
# DELETE /classes/{id}/enroll/{student_id}  — ADMIN only
# ---------------------------------------------------------------------------

@router.delete(
    "/{class_id}/enroll/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a student from a class (Admin only)",
)
async def unenroll_student(
    class_id: uuid.UUID,
    student_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> None:
    """Remove a student's enrollment from this class."""
    result = await db.execute(
        select(ClassEnrollment).where(
            ClassEnrollment.class_id == class_id,
            ClassEnrollment.student_id == student_id,
        )
    )
    enrollment = result.scalar_one_or_none()
    if enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment record not found.",
        )
    await db.delete(enrollment)
