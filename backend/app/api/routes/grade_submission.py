"""Subject-teacher submission and class-head review workflow."""
from typing import Annotated
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User, Role
from app.models.teacher import Teacher
from app.models.class_model import SchoolClass, ClassEnrollment
from app.models.academic import TeacherAssignment
from app.models.grade import Grade, AssessmentType, GradeStatus

router = APIRouter(prefix="/grade-workflow", tags=["Grade Workflow"])

class GradeSubmission(BaseModel):
    student_id: uuid.UUID
    score: float = Field(ge=0, le=100)
    assessment_type: AssessmentType
    term: str = Field(min_length=1, max_length=50)
    academic_year: str = Field(min_length=4, max_length=20)
    comments: str | None = None

class GradeReview(BaseModel):
    approved: bool
    review_comment: str | None = None

async def _teacher(db: AsyncSession, user: User) -> Teacher:
    if user.role != Role.TEACHER:
        raise HTTPException(403, "Teacher access required.")
    teacher = (await db.execute(select(Teacher).where(Teacher.user_id == user.id))).scalar_one_or_none()
    if not teacher:
        raise HTTPException(404, "Teacher profile not found.")
    return teacher

@router.post("/classes/{class_id}/subjects/{subject_id}/submit")
async def submit_grade(class_id: uuid.UUID, subject_id: uuid.UUID, payload: GradeSubmission, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    teacher = await _teacher(db, current_user)
    assignment = (await db.execute(select(TeacherAssignment).where(TeacherAssignment.class_id == class_id, TeacherAssignment.subject_id == subject_id, TeacherAssignment.teacher_id == teacher.id, TeacherAssignment.academic_year == payload.academic_year, TeacherAssignment.is_active.is_(True)))).scalar_one_or_none()
    if not assignment:
        raise HTTPException(403, "You are not assigned to this subject and class.")
    enrolled = (await db.execute(select(ClassEnrollment).where(ClassEnrollment.class_id == class_id, ClassEnrollment.student_id == payload.student_id))).scalar_one_or_none()
    if not enrolled:
        raise HTTPException(400, "Student is not enrolled in this class.")
    grade = Grade(student_id=payload.student_id, class_id=class_id, subject_id=subject_id, graded_by=current_user.id, assessment_type=payload.assessment_type, term=payload.term, academic_year=payload.academic_year, score=payload.score, max_score=100, grade_letter="F", status=GradeStatus.SUBMITTED, comments=payload.comments)
    grade.update_grade_letter()
    db.add(grade)
    await db.commit()
    await db.refresh(grade)
    return {"id": str(grade.id), "status": grade.status.value, "grade_letter": grade.grade_letter, "message": "Grade submitted for class-head review."}

@router.get("/classes/{class_id}/review")
async def review_queue(class_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    teacher = await _teacher(db, current_user)
    school_class = (await db.execute(select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.class_head_id == teacher.id, SchoolClass.is_active.is_(True)))).scalar_one_or_none()
    if not school_class:
        raise HTTPException(403, "Only the assigned class head can review this class.")
    result = await db.execute(select(Grade).where(Grade.class_id == class_id).order_by(Grade.created_at.desc()))
    return result.scalars().all()

@router.patch("/{grade_id}/review")
async def review_grade(grade_id: uuid.UUID, payload: GradeReview, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    teacher = await _teacher(db, current_user)
    grade = (await db.execute(select(Grade).where(Grade.id == grade_id))).scalar_one_or_none()
    if not grade:
        raise HTTPException(404, "Grade not found.")
    school_class = (await db.execute(select(SchoolClass).where(SchoolClass.id == grade.class_id, SchoolClass.class_head_id == teacher.id))).scalar_one_or_none()
    if not school_class:
        raise HTTPException(403, "Only the assigned class head can review this grade.")
    if grade.status not in (GradeStatus.SUBMITTED, GradeStatus.RETURNED):
        raise HTTPException(409, "Only submitted or returned grades can be reviewed.")
    grade.reviewed_by = current_user.id
    grade.review_comment = payload.review_comment
    grade.status = GradeStatus.APPROVED if payload.approved else GradeStatus.RETURNED
    await db.commit()
    return {"id": str(grade.id), "status": grade.status.value, "message": "Grade review completed."}
