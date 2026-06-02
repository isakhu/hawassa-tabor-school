"""
Student CRUD routes.

Access matrix:
  POST   /students           → ADMIN only
  GET    /students           → ADMIN, TEACHER
  GET    /students/{id}      → ADMIN, TEACHER, or the STUDENT who owns the profile
  PUT    /students/{id}      → ADMIN only
  DELETE /students/{id}      → ADMIN only
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user, require_admin, require_teacher
from app.core.database import get_db
from app.models.student import Student
from app.models.user import Role, User
from app.schemas.student import (
    StudentCreate,
    StudentDetailResponse,
    StudentResponse,
    StudentUpdate,
)

router = APIRouter(prefix="/students", tags=["Students"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_student_or_404(
    student_id: uuid.UUID,
    db: AsyncSession,
    *,
    load_user: bool = False,
) -> Student:
    """Fetch a student by PK, raise 404 if not found."""
    query = select(Student).where(Student.id == student_id)
    if load_user:
        query = query.options(selectinload(Student.user))
    result = await db.execute(query)
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {student_id} not found.",
        )
    return student


# ---------------------------------------------------------------------------
# POST /students  — ADMIN only
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll a new student (Admin only)",
)
async def create_student(
    payload: StudentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> StudentResponse:
    """
    Create a student profile and link it to an existing user account.
    The linked user must have role=STUDENT and must not already have a profile.
    """
    # Verify the user exists and has the correct role
    user_result = await db.execute(select(User).where(User.id == payload.user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if user.role != Role.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The linked user must have role=STUDENT.",
        )

    # Check the user doesn't already have a student profile
    existing = await db.execute(
        select(Student).where(Student.user_id == payload.user_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user already has a student profile.",
        )

    # Check student_number uniqueness
    dup = await db.execute(
        select(Student).where(Student.student_number == payload.student_number)
    )
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Student number '{payload.student_number}' is already in use.",
        )

    student = Student(**payload.model_dump())
    db.add(student)
    await db.flush()
    await db.refresh(student)
    return StudentResponse.model_validate(student)


# ---------------------------------------------------------------------------
# GET /students  — ADMIN, TEACHER
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=list[StudentResponse],
    summary="List all students (Admin and Teacher only)",
)
async def list_students(
    db: Annotated[AsyncSession, Depends(get_db)],
    _staff: Annotated[User, Depends(require_teacher)],
) -> list[StudentResponse]:
    """Return all student profiles. Accessible by Admin and Teacher."""
    result = await db.execute(select(Student).order_by(Student.student_number))
    students = result.scalars().all()
    return [StudentResponse.model_validate(s) for s in students]


# ---------------------------------------------------------------------------
# GET /students/{id}  — ADMIN, TEACHER, or own STUDENT
# ---------------------------------------------------------------------------

@router.get(
    "/{student_id}",
    response_model=StudentDetailResponse,
    summary="Get a student's full profile",
)
async def get_student(
    student_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> StudentDetailResponse:
    """
    Fetch a student's profile with their linked user details.
    - ADMIN and TEACHER can fetch any student.
    - STUDENT can only fetch their own profile.
    """
    student = await _get_student_or_404(student_id, db, load_user=True)

    # Students may only view their own profile
    if current_user.role == Role.STUDENT and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile.",
        )

    return StudentDetailResponse.model_validate(student)


# ---------------------------------------------------------------------------
# PUT /students/{id}  — ADMIN only
# ---------------------------------------------------------------------------

@router.put(
    "/{student_id}",
    response_model=StudentResponse,
    summary="Update a student's profile (Admin only)",
)
async def update_student(
    student_id: uuid.UUID,
    payload: StudentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> StudentResponse:
    """
    Partially update a student profile.
    Only non-None fields in the payload are applied.
    student_number and user_id cannot be changed after creation.
    """
    student = await _get_student_or_404(student_id, db)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    await db.flush()
    await db.refresh(student)
    return StudentResponse.model_validate(student)


# ---------------------------------------------------------------------------
# DELETE /students/{id}  — ADMIN only
# ---------------------------------------------------------------------------

@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a student profile (Admin only)",
)
async def delete_student(
    student_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> None:
    """
    Permanently delete a student profile.
    The linked User account is NOT deleted — only the student profile row.
    """
    student = await _get_student_or_404(student_id, db)
    await db.delete(student)
