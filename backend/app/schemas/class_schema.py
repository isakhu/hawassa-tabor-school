"""
Class Pydantic schemas.
Defines request bodies and response payloads for class endpoints.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.teacher import TeacherResponse


class ClassBase(BaseModel):
    class_name: str = Field(..., min_length=2, max_length=100, examples=["Mathematics 10A"])
    grade_level: str = Field(..., min_length=1, max_length=20, examples=["Grade 10"])
    section: str = Field(..., min_length=1, max_length=20, examples=["A"])
    academic_year: str = Field(..., min_length=4, max_length=20, examples=["2024-2025"])
    room_number: Optional[str] = Field(None, max_length=20, examples=["Room 204"])

    @field_validator("class_name", "grade_level", "section", "academic_year")
    @classmethod
    def required_text_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

    @field_validator("room_number")
    @classmethod
    def normalize_room_number(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ClassCreate(ClassBase):
    """POST /classes — admin creates a class and optionally assigns a teacher."""
    teacher_id: Optional[uuid.UUID] = Field(None, examples=["c7d4e5f6-0000-0000-0000-000000000000"])


class ClassUpdate(BaseModel):
    """PUT /classes/{id} — partial update, all fields optional."""
    class_name: Optional[str] = Field(None, min_length=2, max_length=100)
    grade_level: Optional[str] = Field(None, min_length=1, max_length=20)
    section: Optional[str] = Field(None, min_length=1, max_length=20)
    academic_year: Optional[str] = Field(None, min_length=4, max_length=20)
    room_number: Optional[str] = Field(None, max_length=20)
    teacher_id: Optional[uuid.UUID] = None

    @field_validator("class_name", "grade_level", "section", "academic_year")
    @classmethod
    def updated_text_must_not_be_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value

    @field_validator("room_number")
    @classmethod
    def normalize_updated_room_number(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value or None


class EnrollStudentRequest(BaseModel):
    """POST /classes/{id}/enroll — enroll a student into this class."""
    student_id: uuid.UUID = Field(..., examples=["a3f1c2d4-0000-0000-0000-000000000000"])


class ClassResponse(ClassBase):
    """Returned from list and create endpoints."""
    id: uuid.UUID
    teacher_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClassDetailResponse(ClassResponse):
    """Extended response used by GET /classes/{id}."""
    teacher: Optional[TeacherResponse]
    enrolled_student_count: int = 0

    model_config = ConfigDict(from_attributes=True)
