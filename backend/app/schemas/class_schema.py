"""
Class Pydantic schemas.
Defines request bodies and response payloads for class endpoints.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.teacher import TeacherResponse


# ---------------------------------------------------------------------------
# Shared base
# ---------------------------------------------------------------------------

class ClassBase(BaseModel):
    class_name: str = Field(
        ..., min_length=2, max_length=100, examples=["Mathematics 10A"]
    )
    grade_level: str = Field(
        ..., min_length=1, max_length=20, examples=["Grade 10"]
    )
    section: str = Field(
        ..., min_length=1, max_length=20, examples=["A"]
    )
    academic_year: str = Field(
        ..., min_length=4, max_length=20, examples=["2024-2025"]
    )
    room_number: Optional[str] = Field(None, max_length=20, examples=["Room 204"])


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class ClassCreate(ClassBase):
    """POST /classes — admin creates a class and optionally assigns a teacher."""
    teacher_id: Optional[uuid.UUID] = Field(
        None, examples=["c7d4e5f6-0000-0000-0000-000000000000"]
    )


class ClassUpdate(BaseModel):
    """PUT /classes/{id} — partial update, all fields optional."""
    class_name: Optional[str] = Field(None, max_length=100)
    grade_level: Optional[str] = Field(None, max_length=20)
    section: Optional[str] = Field(None, max_length=20)
    academic_year: Optional[str] = Field(None, max_length=20)
    room_number: Optional[str] = Field(None, max_length=20)
    teacher_id: Optional[uuid.UUID] = None


# ---------------------------------------------------------------------------
# Enrollment schemas
# ---------------------------------------------------------------------------

class EnrollStudentRequest(BaseModel):
    """POST /classes/{id}/enroll — enroll a student into this class."""
    student_id: uuid.UUID = Field(
        ..., examples=["a3f1c2d4-0000-0000-0000-000000000000"]
    )


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class ClassResponse(ClassBase):
    """Returned from list and create endpoints."""
    id: uuid.UUID
    teacher_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class ClassDetailResponse(ClassResponse):
    """
    Extended response that embeds the assigned teacher.
    Used by GET /classes/{id}.
    """
    teacher: Optional[TeacherResponse]
    enrolled_student_count: int = 0

    model_config = {"from_attributes": True}
