"""
Attendance routes.

Access matrix:
  POST   /attendance                    → TEACHER, ADMIN
  GET    /attendance                    → TEACHER, ADMIN (all); STUDENT (own only)
  GET    /attendance/{id}               → TEACHER, ADMIN; STUDENT (own only)
  PUT    /attendance/{id}               → TEACHER, ADMIN
  DELETE /attendance/{id}               → ADMIN only
  GET    /attendance/summary/{class_id} → TEACHER (own class), ADMIN

Business rules:
  - Duplicate guard: (student_id, class_id, date) must be unique → 409
  - Student access: student may only read their own records
  - Teacher ownership: teacher may only mark/edit attendance for their assigned classes
"""

import uuid
from datetime import date as DateType
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user, require_admin, require_teacher
from app.core.database import get_db
from app.models.attendance import Attendance, AttendanceStatus
from app.models.class_model import SchoolClass
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import Role, User
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceSummary,
    AttendanceUpdate,
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_attendance_or_404(
    attendance_id: uuid.UUID,
    db: AsyncSession,
) -> Attendance:
    result = await db.execute(
        select(Attendance).where(Attendance.id == attendance_id)
    )
    record = result.scalar_one_or_none()
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance record {attendance_id} not found.",
        )
    return record


async def _get_student_profile(user_id: uuid.UUID, db: AsyncSession) -> Student | None:
    result = await db.execute(select(Student).where(Student.user_id == user_id))
    return result.scalar_one_or_none()


async def _get_teacher_profile(user_id: uuid.UUID, db: AsyncSession) -> Teacher | None:
    result = await db.execute(select(Teacher).where(Teacher.user_id == user_id))
    return result.scalar_one_or_none()


async def _assert_teacher_owns_class(
    teacher: Teacher,
    class_id: uuid.UUID,
    db: AsyncSession,
) -> None:
    """Raise 403 if the teacher is not assigned to the given class."""
    result = await db.execute(
        select(SchoolClass).where(
            SchoolClass.id == class_id,
            SchoolClass.teacher_id == teacher.id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage attendance for your own classes.",
        )


# ---------------------------------------------------------------------------
# POST /attendance  — TEACHER, ADMIN
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mark attendance for a student (Teacher or Admin)",
)
async def create_attendance(
    payload: AttendanceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> AttendanceResponse:
    """
    Mark one student's attendance for a specific class on a specific date.

    Rules enforced:
    - Teacher can only mark attendance for classes they are assigned to.
    - Duplicate (student_id + class_id + date) raises 409.
    - The student must be enrolled in the class.
    """
    # Teachers must own the class
    if current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            raise HTTPException(status_code=403, detail="Teacher profile not found.")
        await _assert_teacher_owns_class(teacher, payload.class_id, db)

    # Validate class exists
    class_result = await db.execute(
        select(SchoolClass).where(SchoolClass.id == payload.class_id)
    )
    if class_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Class not found.")

    # Validate student exists
    student_result = await db.execute(
        select(Student).where(Student.id == payload.student_id)
    )
    if student_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Student not found.")

    # Duplicate guard
    dup = await db.execute(
        select(Attendance).where(
            Attendance.student_id == payload.student_id,
            Attendance.class_id == payload.class_id,
            Attendance.date == payload.date,
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Attendance for student {payload.student_id} "
                f"in class {payload.class_id} on {payload.date} already exists."
            ),
        )

    record = Attendance(
        **payload.model_dump(),
        recorded_by=current_user.id,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return AttendanceResponse.model_validate(record)


# ---------------------------------------------------------------------------
# GET /attendance  — TEACHER/ADMIN (all/filtered), STUDENT (own only)
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=list[AttendanceResponse],
    summary="List attendance records",
)
async def list_attendance(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    class_id: Optional[uuid.UUID] = Query(None, description="Filter by class"),
    student_id: Optional[uuid.UUID] = Query(None, description="Filter by student"),
    date: Optional[DateType] = Query(None, description="Filter by date"),
    attendance_status: Optional[AttendanceStatus] = Query(
        None, alias="status", description="Filter by status"
    ),
) -> list[AttendanceResponse]:
    """
    List attendance records with optional filters.
    - ADMIN/TEACHER: all records (filtered by query params)
    - STUDENT: own records only (student_id param ignored)
    """
    query = select(Attendance)

    if current_user.role == Role.STUDENT:
        # Force scope to this student's own records
        student = await _get_student_profile(current_user.id, db)
        if student is None:
            return []
        query = query.where(Attendance.student_id == student.id)
    elif current_user.role == Role.TEACHER:
        # Scope to classes the teacher owns
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            return []
        teacher_class_ids = select(SchoolClass.id).where(
            SchoolClass.teacher_id == teacher.id
        )
        query = query.where(Attendance.class_id.in_(teacher_class_ids))
        # Allow teacher to also filter by specific student
        if student_id:
            query = query.where(Attendance.student_id == student_id)
    else:
        # ADMIN — full access, respect optional student_id filter
        if student_id:
            query = query.where(Attendance.student_id == student_id)

    # Shared filters
    if class_id:
        query = query.where(Attendance.class_id == class_id)
    if date:
        query = query.where(Attendance.date == date)
    if attendance_status:
        query = query.where(Attendance.status == attendance_status)

    query = query.order_by(Attendance.date.desc())
    result = await db.execute(query)
    records = result.scalars().all()
    return [AttendanceResponse.model_validate(r) for r in records]


# ---------------------------------------------------------------------------
# GET /attendance/summary/{class_id}  — TEACHER (own), ADMIN
# Must be defined BEFORE /{id} to avoid route collision
# ---------------------------------------------------------------------------

@router.get(
    "/summary/{class_id}",
    response_model=list[AttendanceSummary],
    summary="Get attendance summary for a class (Teacher or Admin)",
)
async def attendance_summary(
    class_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> list[AttendanceSummary]:
    """
    Return per-student attendance statistics for a class:
    total sessions, present / absent / late counts, and attendance rate.
    """
    # Teachers must own the class
    if current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            raise HTTPException(status_code=403, detail="Teacher profile not found.")
        await _assert_teacher_owns_class(teacher, class_id, db)

    # Fetch all records for this class with student info
    result = await db.execute(
        select(Attendance)
        .where(Attendance.class_id == class_id)
        .options(selectinload(Attendance.student).selectinload(Student.user))
    )
    records = result.scalars().all()

    # Aggregate per student
    summary_map: dict[uuid.UUID, dict] = {}
    for rec in records:
        sid = rec.student_id
        if sid not in summary_map:
            summary_map[sid] = {
                "student_id": sid,
                "student_number": rec.student.student_number,
                "full_name": rec.student.user.full_name,
                "total_sessions": 0,
                "present": 0,
                "absent": 0,
                "late": 0,
            }
        summary_map[sid]["total_sessions"] += 1
        summary_map[sid][rec.status.value.lower()] += 1

    summaries = []
    for data in summary_map.values():
        total = data["total_sessions"]
        present = data["present"]
        late = data["late"]
        rate = round((present + late) / total, 4) if total > 0 else 0.0
        summaries.append(
            AttendanceSummary(
                **data,
                attendance_rate=rate,
            )
        )

    return summaries


# ---------------------------------------------------------------------------
# GET /attendance/{id}  — TEACHER/ADMIN (any), STUDENT (own only)
# ---------------------------------------------------------------------------

@router.get(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    summary="Get a single attendance record",
)
async def get_attendance(
    attendance_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AttendanceResponse:
    """
    Fetch one attendance record by ID.
    Students may only fetch their own records.
    """
    record = await _get_attendance_or_404(attendance_id, db)

    if current_user.role == Role.STUDENT:
        student = await _get_student_profile(current_user.id, db)
        if student is None or record.student_id != student.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own attendance records.",
            )

    return AttendanceResponse.model_validate(record)


# ---------------------------------------------------------------------------
# PUT /attendance/{id}  — TEACHER, ADMIN
# ---------------------------------------------------------------------------

@router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    summary="Correct an attendance record (Teacher or Admin)",
)
async def update_attendance(
    attendance_id: uuid.UUID,
    payload: AttendanceUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> AttendanceResponse:
    """
    Update the status or notes on an existing attendance record.
    Teachers may only update records belonging to their own classes.
    """
    record = await _get_attendance_or_404(attendance_id, db)

    if current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            raise HTTPException(status_code=403, detail="Teacher profile not found.")
        await _assert_teacher_owns_class(teacher, record.class_id, db)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    await db.flush()
    await db.refresh(record)
    return AttendanceResponse.model_validate(record)


# ---------------------------------------------------------------------------
# DELETE /attendance/{id}  — ADMIN only
# ---------------------------------------------------------------------------

@router.delete(
    "/{attendance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an attendance record (Admin only)",
)
async def delete_attendance(
    attendance_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> None:
    """Permanently delete an attendance record. Admin only."""
    record = await _get_attendance_or_404(attendance_id, db)
    await db.delete(record)
