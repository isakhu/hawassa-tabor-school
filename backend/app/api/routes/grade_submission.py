"""Subject-teacher grade submission and class-head review workflow."""
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
from app.models.grade import Grade

router = APIRouter(prefix="/grade-workflow", tags=["Grade Workflow"])

class GradeSubmission(BaseModel):
    student_id: uuid.UUID
    score: float = Field(ge=0, le=100)
    assessment_type: str = Field(min_length=2, max_length=50)
    term: str = Field(min_length=1, max_length=50)
    comments: str | None = None

async def _teacher(db: AsyncSession, user: User) -> Teacher:
    if user.role != Role.TEACHER:
        raise HTTPException(status_code=403, detail="Teacher access required.")
    teacher = (await db.execute(select(Teacher).where(Teacher.user_id == user.id))).scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")
    return teacher

@router.post("/classes/{class_id}/subjects/{subject_id}/submit")
async def submit_grade(class_id: uuid.UUID, subject_id: uuid.UUID, payload: GradeSubmission, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    teacher = await _teacher(db, current_user)
    assignment = (await db.execute(select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.teacher_id == teacher.id, SchoolClass.is_active.is_(True)))).scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=403, detail="This teacher is not assigned to this class.")
    enrolled = (await db.execute(select(ClassEnrollment).where(ClassEnrollment.class_id == class_id, ClassEnrollment.student_id == payload.student_id))).scalar_one_or_none()
    if not enrolled:
        raise HTTPException(status_code=400, detail="Student is not enrolled in this class.")
    grade = Grade(student_id=payload.student_id, class_id=class_id, graded_by=current_user.id, assessment_type=payload.assessment_type, term=payload.term, score=payload.score, max_score=100, comments=payload.comments)
    db.add(grade)
    await db.commit()
    return {"id": grade.id, "status": "submitted", "message": "Grade submitted for class-head review."}

@router.get("/classes/{class_id}/review")
async def review_grades(class_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    teacher = await _teacher(db, current_user)
    school_class = (await db.execute(select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.class_head_id == teacher.id, SchoolClass.is_active.is_(True)))).scalar_one_or_none()
    if not school_class:
        raise HTTPException(status_code=403, detail="Only the assigned class head can review this class.")
    result = await db.execute(select(Grade).where(Grade.class_id == class_id).order_by(Grade.created_at.desc()))
    return result.scalars().all()
