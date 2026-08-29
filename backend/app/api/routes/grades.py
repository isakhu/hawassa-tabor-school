"""
Grades routes.

Access matrix:
  POST   /grades                      → TEACHER, ADMIN
  GET    /grades                      → TEACHER/ADMIN (all/filtered), STUDENT (own only)
  GET    /grades/{id}                 → TEACHER/ADMIN (any), STUDENT (own only)
  PUT    /grades/{id}                 → TEACHER (own classes), ADMIN
  DELETE /grades/{id}                 → ADMIN only
  GET    /grades/report/{student_id}  → ADMIN, TEACHER (own classes), STUDENT (own)

Business rules:
  - grade_letter is ALWAYS auto-calculated from (score / max_score * 100)
  - Teacher can only grade students in their own assigned classes
  - Student can only read their own grades
  - Teacher report access is limited to classes assigned to that teacher
"""

import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user, require_admin, require_teacher
from app.core.database import get_db
from app.models.class_model import SchoolClass
from app.models.grade import AssessmentType, Grade
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import Role, User
from app.schemas.grade import (
    GradeCreate,
    GradeReportItem,
    GradeResponse,
    GradeUpdate,
    SubjectAverageResponse,
)
from app.utils.grading import calculate_grade_letter

router = APIRouter(prefix="/grades", tags=["Grades"])


@router.get(
    "/stats/subject-averages",
    response_model=list[SubjectAverageResponse],
    summary="Get average performance per subject (Admin only)",
)
async def get_subject_averages(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> list[SubjectAverageResponse]:
    query = (
        select(
            func.coalesce(func.nullif(func.split_part(SchoolClass.class_name, " - ", 2), ""), SchoolClass.class_name).label("subject"),
            func.avg(Grade.score).label("average"),
        )
        .join(Grade, Grade.class_id == SchoolClass.id)
        .group_by(text("subject"))
        .order_by(text("average DESC"))
    )
    result = await db.execute(query)
    rows = result.all()
    return [SubjectAverageResponse(subject=row.subject, average=round(row.average, 2)) for row in rows]


async def _get_grade_or_404(grade_id: uuid.UUID, db: AsyncSession) -> Grade:
    result = await db.execute(select(Grade).where(Grade.id == grade_id))
    grade = result.scalar_one_or_none()
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Grade {grade_id} not found.")
    return grade


async def _get_teacher_profile(user_id: uuid.UUID, db: AsyncSession) -> Teacher | None:
    result = await db.execute(select(Teacher).where(Teacher.user_id == user_id))
    return result.scalar_one_or_none()


async def _get_student_profile(user_id: uuid.UUID, db: AsyncSession) -> Student | None:
    result = await db.execute(select(Student).where(Student.user_id == user_id))
    return result.scalar_one_or_none()


async def _assert_teacher_owns_class(teacher: Teacher, class_id: uuid.UUID, db: AsyncSession) -> None:
    result = await db.execute(
        select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.teacher_id == teacher.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage grades for your own assigned classes.")


async def _assert_student_enrolled(student_id: uuid.UUID, class_id: uuid.UUID, db: AsyncSession) -> None:
    """Ensure academic records cannot be created for an unrelated student/class pair."""
    result = await db.execute(
        select(Student.id).join(Student.classes).where(
            Student.id == student_id,
            SchoolClass.id == class_id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Student is not enrolled in the selected class.",
        )


def _to_response(grade: Grade) -> GradeResponse:
    percentage = round((grade.score / grade.max_score) * 100, 2) if grade.max_score else 0.0
    return GradeResponse(
        id=grade.id,
        student_id=grade.student_id,
        class_id=grade.class_id,
        graded_by=grade.graded_by,
        assessment_type=grade.assessment_type,
        term=grade.term,
        score=grade.score,
        max_score=grade.max_score,
        percentage=percentage,
        grade_letter=grade.grade_letter,
        comments=grade.comments,
        created_at=grade.created_at,
        updated_at=grade.updated_at,
    )


@router.post("", response_model=GradeResponse, status_code=status.HTTP_201_CREATED, summary="Submit a grade (Teacher or Admin)")
async def create_grade(
    payload: GradeCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> GradeResponse:
    if current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            raise HTTPException(status_code=403, detail="Teacher profile not found.")
        await _assert_teacher_owns_class(teacher, payload.class_id, db)

    if not (await db.execute(select(SchoolClass).where(SchoolClass.id == payload.class_id))).scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Class not found.")
    if not (await db.execute(select(Student).where(Student.id == payload.student_id))).scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Student not found.")

    await _assert_student_enrolled(payload.student_id, payload.class_id, db)

    percentage = round((payload.score / payload.max_score) * 100, 2)
    grade = Grade(
        **payload.model_dump(),
        grade_letter=calculate_grade_letter(percentage),
        graded_by=current_user.id,
    )
    db.add(grade)
    await db.flush()
    await db.refresh(grade)
    return _to_response(grade)


@router.get("", response_model=list[GradeResponse], summary="List grades")
async def list_grades(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    class_id: Optional[uuid.UUID] = Query(None),
    student_id: Optional[uuid.UUID] = Query(None),
    term: Optional[str] = Query(None),
    assessment_type: Optional[AssessmentType] = Query(None),
) -> list[GradeResponse]:
    query = select(Grade)
    if current_user.role == Role.STUDENT:
        student = await _get_student_profile(current_user.id, db)
        if student is None:
            return []
        query = query.where(Grade.student_id == student.id)
    elif current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            return []
        teacher_class_ids = select(SchoolClass.id).where(SchoolClass.teacher_id == teacher.id)
        query = query.where(Grade.class_id.in_(teacher_class_ids))
        if student_id:
            query = query.where(Grade.student_id == student_id)
    elif student_id:
        query = query.where(Grade.student_id == student_id)

    if class_id:
        query = query.where(Grade.class_id == class_id)
    if term:
        query = query.where(Grade.term == term)
    if assessment_type:
        query = query.where(Grade.assessment_type == assessment_type)

    query = query.order_by(Grade.created_at.desc())
    result = await db.execute(query)
    return [_to_response(g) for g in result.scalars().all()]


@router.get("/report/{student_id}", response_model=list[GradeReportItem], summary="Get a student's grade report aggregated by class and term")
async def grade_report(
    student_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[GradeReportItem]:
    if current_user.role == Role.STUDENT:
        student = await _get_student_profile(current_user.id, db)
        if student is None or student.id != student_id:
            raise HTTPException(status_code=403, detail="You can only view your own report.")

    teacher_class_ids: set[uuid.UUID] | None = None
    if current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            raise HTTPException(status_code=403, detail="Teacher profile not found.")
        class_result = await db.execute(select(SchoolClass.id).where(SchoolClass.teacher_id == teacher.id))
        teacher_class_ids = {row[0] for row in class_result.all()}

    result = await db.execute(
        select(Grade)
        .where(Grade.student_id == student_id)
        .options(selectinload(Grade.school_class))
        .order_by(Grade.term, Grade.class_id)
    )
    grades = result.scalars().all()

    if current_user.role == Role.TEACHER:
        grades = [g for g in grades if g.class_id in (teacher_class_ids or set())]

    buckets: dict[tuple[uuid.UUID, str], dict] = {}
    for grade in grades:
        key = (grade.class_id, grade.term)
        if key not in buckets:
            buckets[key] = {
                "class_id": grade.class_id,
                "class_name": grade.school_class.class_name,
                "term": grade.term,
                "scores": [],
                "percentages": [],
            }
        percentage = round((grade.score / grade.max_score) * 100, 2) if grade.max_score else 0.0
        buckets[key]["scores"].append(grade.score)
        buckets[key]["percentages"].append(percentage)

    return [
        GradeReportItem(
            class_id=data["class_id"],
            class_name=data["class_name"],
            term=data["term"],
            assessment_count=len(data["scores"]),
            average_score=round(sum(data["scores"]) / len(data["scores"]), 2),
            average_percentage=round(sum(data["percentages"]) / len(data["percentages"]), 2),
            overall_grade_letter=calculate_grade_letter(round(sum(data["percentages"]) / len(data["percentages"]), 2)),
        )
        for data in buckets.values()
    ]


@router.get("/{grade_id}", response_model=GradeResponse, summary="Get a single grade record")
async def get_grade(
    grade_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> GradeResponse:
    grade = await _get_grade_or_404(grade_id, db)
    if current_user.role == Role.STUDENT:
        student = await _get_student_profile(current_user.id, db)
        if student is None or grade.student_id != student.id:
            raise HTTPException(status_code=403, detail="You can only view your own grades.")
    return _to_response(grade)


@router.put("/{grade_id}", response_model=GradeResponse, summary="Update a grade (Teacher or Admin)")
async def update_grade(
    grade_id: uuid.UUID,
    payload: GradeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> GradeResponse:
    grade = await _get_grade_or_404(grade_id, db)
    if current_user.role == Role.TEACHER:
        teacher = await _get_teacher_profile(current_user.id, db)
        if teacher is None:
            raise HTTPException(status_code=403, detail="Teacher profile not found.")
        await _assert_teacher_owns_class(teacher, grade.class_id, db)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(grade, field, value)
    grade.update_grade_letter()
    await db.flush()
    await db.refresh(grade)
    return _to_response(grade)


@router.delete("/{grade_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a grade record (Admin only)")
async def delete_grade(
    grade_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> None:
    grade = await _get_grade_or_404(grade_id, db)
    await db.delete(grade)
