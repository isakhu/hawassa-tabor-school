"""
Grade Pydantic schemas.
grade_letter is NEVER accepted as input — always auto-calculated from score.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.grade import AssessmentType


class GradeCreate(BaseModel):
    """POST /grades — teacher submits a grade."""
    student_id: uuid.UUID = Field(...)
    class_id: uuid.UUID = Field(...)
    assessment_type: AssessmentType = Field(...)
    term: str = Field(..., min_length=2, max_length=50)
    score: float = Field(..., ge=0)
    max_score: int = Field(default=100, ge=1, le=1000)
    comments: Optional[str] = Field(None, max_length=1000)

    @field_validator("term")
    @classmethod
    def term_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Term cannot be blank.")
        return value

    @model_validator(mode="after")
    def score_within_max(self) -> "GradeCreate":
        if self.score > self.max_score:
            raise ValueError(f"Score ({self.score}) cannot exceed max_score ({self.max_score}).")
        return self


class GradeUpdate(BaseModel):
    """PUT /grades/{id} — partial update."""
    assessment_type: Optional[AssessmentType] = None
    term: Optional[str] = Field(None, min_length=2, max_length=50)
    score: Optional[float] = Field(None, ge=0)
    max_score: Optional[int] = Field(None, ge=1, le=1000)
    comments: Optional[str] = Field(None, max_length=1000)

    @field_validator("term")
    @classmethod
    def updated_term_must_not_be_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Term cannot be blank.")
        return value

    @model_validator(mode="after")
    def score_within_supplied_max(self) -> "GradeUpdate":
        if self.score is not None and self.max_score is not None and self.score > self.max_score:
            raise ValueError(f"Score ({self.score}) cannot exceed max_score ({self.max_score}).")
        return self


class GradeResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    class_id: uuid.UUID
    graded_by: Optional[uuid.UUID]
    assessment_type: AssessmentType
    term: str
    score: float
    max_score: int
    percentage: float
    grade_letter: str
    comments: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class GradeReportItem(BaseModel):
    class_id: uuid.UUID
    class_name: str
    term: str
    assessment_count: int
    average_score: float
    average_percentage: float
    overall_grade_letter: str


class SubjectAverageResponse(BaseModel):
    subject: str
    average: float
