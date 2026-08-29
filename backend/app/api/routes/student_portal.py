"""Student-scoped portal endpoints for a high-school workflow."""
from collections import defaultdict
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User, Role
from app.models.student import Student
from app.models.class_model import ClassEnrollment
from app.models.grade import Grade, GradeStatus
from app.utils.grading import calculate_grade_letter

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
    result = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.student_id == student.id)
        .options(selectinload(ClassEnrollment.school_class))
    )
    enrollments = result.scalars().all()
    return {
        "id": student.id,
        "student_number": student.student_number,
        "full_name": student.user.full_name,
        "grade_level": student.grade_level,
        "section": student.section,
        "classes": [
            {"id": e.school_class.id, "name": e.school_class.class_name, "academic_year": e.school_class.academic_year}
            for e in enrollments
        ],
    }

@router.get("/grades")
async def grades(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    """Return only approved subject grades visible to the student."""
    student = await _student(db, current_user)
    result = await db.execute(
        select(Grade)
        .where(Grade.student_id == student.id, Grade.status == GradeStatus.APPROVED)
        .options(selectinload(Grade.subject))
        .order_by(Grade.term, Grade.created_at.desc())
    )
    return result.scalars().all()

@router.get("/results")
async def results(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    """High-school result view: every subject's average mark plus one overall average.

    GPA is intentionally not used here. Each subject is summarized from approved
    assessments and the overall average is the mean of the subject averages.
    """
    student = await _student(db, current_user)
    query = (
        select(Grade)
        .where(Grade.student_id == student.id, Grade.status == GradeStatus.APPROVED)
        .options(selectinload(Grade.subject))
        .order_by(Grade.subject_id, Grade.term, Grade.created_at)
    )
    grades = (await db.execute(query)).scalars().all()

    by_subject: dict[object, list[Grade]] = defaultdict(list)
    for grade in grades:
        by_subject[grade.subject_id].append(grade)

    subjects = []
    for subject_grades in by_subject.values():
        subject = subject_grades[0].subject
        total_score = sum(g.score for g in subject_grades)
        total_max = sum(g.max_score for g in subject_grades)
        average = round((total_score / total_max) * 100, 2) if total_max else 0.0
        subjects.append({
            "subject_id": subject.id,
            "subject_code": subject.code,
            "subject_name": subject.name,
            "average": average,
            "grade": calculate_grade_letter(average),
        })

    subjects.sort(key=lambda item: item["subject_name"].lower())
    overall_average = round(sum(item["average"] for item in subjects) / len(subjects), 2) if subjects else 0.0
    return {
        "student_id": student.id,
        "student_number": student.student_number,
        "student_name": student.user.full_name,
        "grade_level": student.grade_level,
        "section": student.section,
        "subjects": subjects,
        "overall_average": overall_average,
        "overall_grade": calculate_grade_letter(overall_average) if subjects else None,
    }
