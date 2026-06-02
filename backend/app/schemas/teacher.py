"""
Teacher Pydantic schemas.
Defines request bodies and response payloads for teacher endpoints.
"""

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


# ---------------------------------------------------------------------------
# Shared base
# ---------------------------------------------------------------------------

class TeacherBase(BaseModel):
    teacher_number: str = Field(
        ..., min_length=3, max_length=50, examples=["TCH-2024-001"]
    )
    subject_specialization: str = Field(
        ..., min_length=2, max_length=100, examples=["Mathematics"]
    )
    department: Optional[str] = Field(None, max_length=100, examples=["Science"])
    phone_number: Optional[str] = Field(None, max_length=50, examples=["+1234567890"])
    hire_date: Optional[date] = Field(None, examples=["2020-09-01"])


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class TeacherCreate(TeacherBase):
    """
    POST /teachers — body sent by admin.
    user_id links this profile to an existing User with role=TEACHER.
    """
    user_id: uuid.UUID = Field(
        ..., examples=["b5e2d3f6-0000-0000-0000-000000000000"]
    )


class TeacherUpdate(BaseModel):
    """
    PUT /teachers/{id} — all fields optional for partial updates.
    teacher_number and user_id are intentionally excluded (not updatable).
    """
    subject_specialization: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=50)
    hire_date: Optional[date] = None


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class TeacherResponse(TeacherBase):
    """Teacher profile returned by list and create endpoints."""
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class TeacherDetailResponse(TeacherResponse):
    """
    Extended response that embeds the linked User object.
    Used by GET /teachers/{id}.
    """
    user: UserResponse

    model_config = {"from_attributes": True}
