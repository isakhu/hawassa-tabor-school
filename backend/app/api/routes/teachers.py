"""
Teacher CRUD routes.

Access matrix:
  POST   /teachers        → ADMIN only
  GET    /teachers        → ADMIN only
  GET    /teachers/{id}   → ADMIN, or the TEACHER who owns the profile
  PUT    /teachers/{id}   → ADMIN only
  DELETE /teachers/{id}   → ADMIN only

STUDENT role has no access to any teacher endpoint (403 on all).
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.teacher import Teacher
from app.models.user import Role, User
from app.schemas.teacher import (
    TeacherCreate,
    TeacherDetailResponse,
    TeacherResponse,
    TeacherUpdate,
)

router = APIRouter(prefix="/teachers", tags=["Teachers"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_teacher_or_404(
    teacher_id: uuid.UUID,
    db: AsyncSession,
    *,
    load_user: bool = False,
) -> Teacher:
    """Fetch a teacher by PK, raise 404 if not found."""
    query = select(Teacher).where(Teacher.id == teacher_id)
    if load_user:
        query = query.options(selectinload(Teacher.user))
    result = await db.execute(query)
    teacher = result.scalar_one_or_none()
    if teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher {teacher_id} not found.",
        )
    return teacher


# ---------------------------------------------------------------------------
# POST /teachers  — ADMIN only
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=TeacherResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a teacher profile (Admin only)",
)
async def create_teacher(
    payload: TeacherCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> TeacherResponse:
    """
    Create a teacher profile and link it to an existing user account.
    The linked user must have role=TEACHER and must not already have a profile.
    """
    # Verify the linked user exists and is a TEACHER
    user_result = await db.execute(select(User).where(User.id == payload.user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if user.role != Role.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The linked user must have role=TEACHER.",
        )

    # Ensure no duplicate profile for this user
    existing_profile = await db.execute(
        select(Teacher).where(Teacher.user_id == payload.user_id)
    )
    if existing_profile.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user already has a teacher profile.",
        )

    # Ensure teacher_number is globally unique
    dup_number = await db.execute(
        select(Teacher).where(Teacher.teacher_number == payload.teacher_number)
    )
    if dup_number.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Teacher number '{payload.teacher_number}' is already in use.",
        )

    teacher = Teacher(**payload.model_dump())
    db.add(teacher)
    await db.flush()
    await db.refresh(teacher)
    return TeacherResponse.model_validate(teacher)


# ---------------------------------------------------------------------------
# GET /teachers  — ADMIN only
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=list[TeacherResponse],
    summary="List all teachers (Admin only)",
)
async def list_teachers(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> list[TeacherResponse]:
    """
    Return all teacher profiles ordered by teacher_number.
    Restricted to ADMIN — teachers should not enumerate each other.
    """
    result = await db.execute(
        select(Teacher).order_by(Teacher.teacher_number)
    )
    teachers = result.scalars().all()
    return [TeacherResponse.model_validate(t) for t in teachers]


# ---------------------------------------------------------------------------
# GET /teachers/{id}  — ADMIN, or own TEACHER
# ---------------------------------------------------------------------------

@router.get(
    "/{teacher_id}",
    response_model=TeacherDetailResponse,
    summary="Get a teacher's full profile",
)
async def get_teacher(
    teacher_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TeacherDetailResponse:
    """
    Fetch a teacher profile with their linked user details.
    - ADMIN can fetch any teacher.
    - TEACHER can only fetch their own profile.
    - STUDENT gets 403.
    """
    # Block students entirely
    if current_user.role == Role.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students cannot access teacher profiles.",
        )

    teacher = await _get_teacher_or_404(teacher_id, db, load_user=True)

    # Teachers can only view their own profile
    if current_user.role == Role.TEACHER and teacher.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile.",
        )

    return TeacherDetailResponse.model_validate(teacher)


# ---------------------------------------------------------------------------
# PUT /teachers/{id}  — ADMIN only
# ---------------------------------------------------------------------------

@router.put(
    "/{teacher_id}",
    response_model=TeacherResponse,
    summary="Update a teacher's profile (Admin only)",
)
async def update_teacher(
    teacher_id: uuid.UUID,
    payload: TeacherUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> TeacherResponse:
    """
    Partially update a teacher profile.
    Only non-None fields in the payload are applied.
    teacher_number and user_id cannot be changed after creation.
    """
    teacher = await _get_teacher_or_404(teacher_id, db)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(teacher, field, value)

    await db.flush()
    await db.refresh(teacher)
    return TeacherResponse.model_validate(teacher)


# ---------------------------------------------------------------------------
# DELETE /teachers/{id}  — ADMIN only
# ---------------------------------------------------------------------------

@router.delete(
    "/{teacher_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a teacher profile (Admin only)",
)
async def delete_teacher(
    teacher_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> None:
    """
    Permanently delete a teacher profile.
    The linked User account is NOT deleted — only the teacher profile row.
    """
    teacher = await _get_teacher_or_404(teacher_id, db)
    await db.delete(teacher)
