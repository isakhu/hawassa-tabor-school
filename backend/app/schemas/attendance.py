"""
Attendance Pydantic schemas.
Defines request bodies and response payloads for attendance endpoints.
"""

import uuid
from datetime import date as DateType
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.attendance import AttendanceStatus


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class AttendanceCreate(BaseModel):
    """POST /attendance — mark one student's attendance for a class session."""
    student_id: uuid.UUID
    class_id: uuid.UUID
    date: DateType = Field(..., description="Calendar date of the class session (YYYY-MM-DD)")
    status: AttendanceStatus
    notes: Optional[str] = Field(None, max_length=500)


class AttendanceUpdate(BaseModel):
    """PUT /attendance/{id} — correct an existing record. All fields optional."""
    status: Optional[AttendanceStatus] = None
    notes: Optional[str] = Field(None, max_length=500)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class AttendanceResponse(BaseModel):
    """Returned by all attendance endpoints."""
    id: uuid.UUID
    student_id: uuid.UUID
    class_id: uuid.UUID
    recorded_by: Optional[uuid.UUID]
    date: DateType
    status: AttendanceStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Summary schema
# ---------------------------------------------------------------------------

class AttendanceSummary(BaseModel):
    """
    Per-student attendance summary for GET /attendance/summary/{class_id}.
    """
    student_id: uuid.UUID
    student_number: str
    full_name: str
    total_sessions: int
    present: int
    absent: int
    late: int
    attendance_rate: float  # 0.0 – 1.0
