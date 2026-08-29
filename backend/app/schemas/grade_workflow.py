from __future__ import annotations

import uuid
from pydantic import BaseModel, Field
from app.models.grade import AssessmentType


class GradeCreate(BaseModel):
    student_id: uuid.UUID
    class_id: uuid.UUID
    subject_id: uuid.UUID
    academic_year: str = Field(min_length=4, max_length=20)
    assessment_type: AssessmentType
    term: str = Field(min_length=1, max_length=50)
    score: float = Field(ge=0)
    max_score: int = Field(default=100, gt=0)
    comments: str | None = Field(default=None, max_length=1000)


class GradeReview(BaseModel):
    comment: str | None = Field(default=None, max_length=1000)
