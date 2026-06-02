"""
Student Pydantic schemas.
Defines request bodies and response payloads for student endpoints.
"""

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


# ---------------------------------------------------------------------------
# Shared base
# ---------------------------------------------------------------------------

class StudentBase(BaseModel):
    student_number: str = Field(
        ..., min_length=3, max_length=50, examples=["STU-2024-001"]
    )
    grade_level: str = Field(..., min_length=1, max_length=20, examples=["Grade 10"])
    section: str = Field(..., min_length=1, max_length=20, examples=["A"])
    date_of_birth: Optional[date] = Field(None, examples=["2008-05-15"])
    guardian_name: Optional[str] = Field(None, max_length=255, examples=["John Doe"])
    guardian_contact: Optional[str] = Field(None, max_length=50, examples=["+1234567890"])


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class StudentCreate(StudentBase):
    """
    POST /students — body sent by admin.
    user_id links this profile to an existing User with role=STUDENT.
    """
    user_id: uuid.UUID = Field(..., examples=["a3f1c2d4-0000-0000-0000-000000000000"])


class StudentUpdate(BaseModel):
    """
    PUT /students/{id} — all fields optional for partial updates.
    student_number and user_id are intentionally excluded (not updatable).
    """
    grade_level: Optional[str] = Field(None, max_length=20)
    section: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    guardian_name: Optional[str] = Field(None, max_length=255)
    guardian_contact: Optional[str] = Field(None, max_length=50)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class StudentResponse(StudentBase):
    """Full student profile returned by GET and POST endpoints."""
    id: uuid.UUID
    user_id: uuid.UUID
    enrollment_date: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class StudentDetailResponse(StudentResponse):
    """
    Extended response that embeds the linked User object.
    Used by GET /students/{id} and GET /students/me.
    """
    user: UserResponse

    model_config = {"from_attributes": True}
