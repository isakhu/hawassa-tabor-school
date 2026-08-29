"""Teacher grade submission and class-head review workflow."""
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user, require_teacher
from app.core.database import get_db
from app.models.academic import TeacherAssignment
from app.models.class_model import ClassEnrollment, SchoolClass
from app.models.grade import Grade, GradeStatus
from app.models.teacher import Teacher
from app.models.user import Role, User
from app.schemas.grade import GradeCreate, GradeResponse
from app.schemas.grade_workflow import GradeReview

router = APIRouter(prefix="/grade-workflow", tags=["Grade Workflow"])

async def teacher_profile(user: User, db: AsyncSession) -> Teacher:
    result = await db.execute(select(Teacher).where(Teacher.user_id == user.id))
    teacher = result.scalar_one_or_none()
    if teacher is None:
        raise HTTPException(403, "Teacher profile not found.")
    return teacher

async def assignment(db: AsyncSession, teacher_id: uuid.UUID, class_id: uuid.UUID, subject_id: uuid.UUID, year: str) -> TeacherAssignment:
    result = await db.execute(select(TeacherAssignment).where(
        TeacherAssignment.teacher_id == teacher_id,
        TeacherAssignment.class_id == class_id,
        TeacherAssignment.subject_id == subject_id,
        TeacherAssignment.academic_year == year,
        TeacherAssignment.is_active.is_(True),
    ))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(403, "You are not assigned to this class and subject for this academic year.")
    return item

def response(grade: Grade) -> GradeResponse:
    return GradeResponse.model_validate(grade, from_attributes=True)

@router.post("/draft", response_model=GradeResponse, status_code=201)
async def create_draft(payload: GradeCreate, db: Annotated[AsyncSession, Depends(get_db)], user: Annotated[User, Depends(require_teacher)]) -> GradeResponse:
    teacher = await teacher_profile(user, db)
    await assignment(db, teacher.id, payload.class_id, payload.subject_id, payload.academic_year)
    enrolled = await db.execute(select(ClassEnrollment.id).where(ClassEnrollment.class_id == payload.class_id, ClassEnrollment.student_id == payload.student_id))
    if enrolled.scalar_one_or_none() is None:
        raise HTTPException(422, "Student is not enrolled in this class.")
    grade = Grade(**payload.model_dump(), graded_by=user.id, status=GradeStatus.DRAFT)
    grade.update_grade_letter()
    db.add(grade)
    await db.commit()
    await db.refresh(grade)
    return response(grade)

@router.post("/{grade_id}/submit", response_model=GradeResponse)
async def submit_grade(grade_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)], user: Annotated[User, Depends(require_teacher)]) -> GradeResponse:
    teacher = await teacher_profile(user, db)
    grade = (await db.execute(select(Grade).where(Grade.id == grade_id))).scalar_one_or_none()
    if grade is None:
        raise HTTPException(404, "Grade not found.")
    if grade.graded_by != user.id:
        raise HTTPException(403, "You can only submit grades you entered.")
    await assignment(db, teacher.id, grade.class_id, grade.subject_id, grade.academic_year)
    if grade.status not in (GradeStatus.DRAFT, GradeStatus.RETURNED):
        raise HTTPException(409, f"Grade cannot be submitted from {grade.status.value} status.")
    grade.status = GradeStatus.SUBMITTED
    grade.review_comment = None
    await db.commit()
    await db.refresh(grade)
    return response(grade)

async def review_grade(grade_id: uuid.UUID, payload: GradeReview, db: AsyncSession, user: User, approved: bool) -> GradeResponse:
    grade = (await db.execute(select(Grade).where(Grade.id == grade_id))).scalar_one_or_none()
    if grade is None:
        raise HTTPException(404, "Grade not found.")
    school_class = (await db.execute(select(SchoolClass).where(SchoolClass.id == grade.class_id))).scalar_one_or_none()
    if school_class is None:
        raise HTTPException(404, "Class not found.")
    if user.role == Role.ADMIN:
        pass
    else:
        teacher = await teacher_profile(user, db)
        if school_class.class_head_id != teacher.id:
            raise HTTPException(403, "Only the assigned class head can review this grade.")
    if grade.status != GradeStatus.SUBMITTED:
        raise HTTPException(409, "Only submitted grades can be reviewed.")
    grade.status = GradeStatus.APPROVED if approved else GradeStatus.RETURNED
    grade.reviewed_by = user.id
    grade.review_comment = payload.comment
    await db.commit()
    await db.refresh(grade)
    return response(grade)

@router.post("/{grade_id}/return", response_model=GradeResponse)
async def return_grade(grade_id: uuid.UUID, payload: GradeReview, db: Annotated[AsyncSession, Depends(get_db)], user: Annotated[User, Depends(get_current_user)]) -> GradeResponse:
    return await review_grade(grade_id, payload, db, user, False)

@router.post("/{grade_id}/approve", response_model=GradeResponse)
async def approve_grade(grade_id: uuid.UUID, payload: GradeReview, db: Annotated[AsyncSession, Depends(get_db)], user: Annotated[User, Depends(get_current_user)]) -> GradeResponse:
    return await review_grade(grade_id, payload, db, user, True)
