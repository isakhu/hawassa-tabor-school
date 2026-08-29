"""Attendance operations restricted to the assigned class head."""
from datetime import date
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User, Role
from app.models.teacher import Teacher
from app.models.class_model import SchoolClass, ClassEnrollment
from app.models.attendance import Attendance, AttendanceStatus

router = APIRouter(prefix="/class-head/attendance", tags=["Class Head Attendance"])

class AttendanceEntry(BaseModel):
    student_id: str
    status: AttendanceStatus
    note: str | None = None

async def _owned_class(db: AsyncSession, user: User, class_id: str) -> SchoolClass:
    if user.role != Role.TEACHER:
        raise HTTPException(status_code=403, detail="Teacher access required.")
    teacher = (await db.execute(select(Teacher).where(Teacher.user_id == user.id))).scalar_one_or_none()
    school_class = (await db.execute(select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.is_active.is_(True)))).scalar_one_or_none()
    if not teacher or not school_class or school_class.class_head_id != teacher.id:
        raise HTTPException(status_code=403, detail="Only the assigned class head can manage attendance for this class.")
    return school_class

@router.post("/{class_id}")
async def mark_attendance(class_id: str, entries: list[AttendanceEntry], db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    school_class = await _owned_class(db, current_user, class_id)
    saved = 0
    for entry in entries:
        enrollment = (await db.execute(select(ClassEnrollment).where(ClassEnrollment.class_id == school_class.id, ClassEnrollment.student_id == entry.student_id))).scalar_one_or_none()
        if enrollment is None:
            raise HTTPException(status_code=400, detail=f"Student {entry.student_id} is not enrolled in this class.")
        record = (await db.execute(select(Attendance).where(Attendance.class_id == school_class.id, Attendance.student_id == entry.student_id, Attendance.date == date.today()))).scalar_one_or_none()
        if record:
            record.status = entry.status
            record.note = entry.note
        else:
            db.add(Attendance(class_id=school_class.id, student_id=entry.student_id, date=date.today(), status=entry.status, note=entry.note, marked_by=current_user.id))
        saved += 1
    await db.commit()
    return {"class_id": class_id, "date": date.today(), "saved": saved, "message": "Attendance recorded by class head."}
