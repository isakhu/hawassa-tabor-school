"""
Grade Pydantic schemas.
grade_letter is NEVER accepted as input — always auto-calculated from score.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.grade import AssessmentType
from app.utils.grading import calculate_grade_letter


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class GradeCreate(BaseModel):
    """POST /grades — teacher submits a grade."""
    student_id: uuid.UUID = Field(
        ..., examples=["a3f1c2d4-0000-0000-0000-000000000000"]
    )
    class_id: uuid.UUID = Field(
        ..., examples=["c7d4e5f6-0000-0000-0000-000000000000"]
    )
    assessment_type: AssessmentType = Field(..., examples=[AssessmentType.EXAM])
    term: str = Field(..., min_length=2, max_length=50, examples=["Fall 2024"])
    score: float = Field(..., ge=0, examples=[85.5])
    max_score: int = Field(default=100, ge=1, le=1000, examples=[100])
    comments: Optional[str] = Field(None, max_length=1000)

    @field_validator("score")
    @classmethod
    def score_must_be_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Score cannot be negative.")
        return v

    @model_validator(mode="after")
    def score_within_max(self) -> "GradeCreate":
        if self.score > self.max_score:
            raise ValueError(
                f"Score ({self.score}) cannot exceed max_score ({self.max_score})."
            )
        return self


class GradeUpdate(BaseModel):
    """
    PUT /grades/{id} — partial update.
    grade_letter is intentionally excluded — it is recalculated automatically.
    """
    assessment_type: Optional[AssessmentType] = None
    term: Optional[str] = Field(None, max_length=50)
    score: Optional[float] = Field(None, ge=0)
    max_score: Optional[int] = Field(None, ge=1, le=1000)
    comments: Optional[str] = Field(None, max_length=1000)

    @model_validator(mode="after")
    def score_within_max(self) -> "GradeUpdate":
        if self.score is not None and self.max_score is not None:
            if self.score > self.max_score:
                raise ValueError(
                    f"Score ({self.score}) cannot exceed max_score ({self.max_score})."
                )
        return self


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class GradeResponse(BaseModel):
    """
    Returned by all grade endpoints.
    grade_letter is always present — auto-calculated, never user-supplied.
    """
    id: uuid.UUID
    student_id: uuid.UUID
    class_id: uuid.UUID
    graded_by: Optional[uuid.UUID]
    assessment_type: AssessmentType
    term: str
    score: float
    max_score: int
    percentage: float           # score / max_score * 100, rounded to 2dp
    grade_letter: str           # auto-calculated e.g. "A+", "B-", "F"
    comments: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Report schemas
# ---------------------------------------------------------------------------

class GradeReportItem(BaseModel):
    """
    One row in a student's grade report — aggregated per class/term.
    GET /grades/report/{student_id}
    """
    class_id: uuid.UUID
    class_name: str
    term: str
    assessment_count: int
    average_score: float
    average_percentage: float
    overall_grade_letter: str   # calculated from average_percentage


class SubjectAverageResponse(BaseModel):
    """
    Statistics for subject performance across all classes.
    """
    subject: str
    average: float
