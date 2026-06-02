"""
Models package.
Imports all ORM models so they are registered on Base.metadata.
This ensures SQLAlchemy can create tables when create_all_tables() is called.
Add every new model here.
"""

from app.models.user import Role, User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.class_model import ClassEnrollment, SchoolClass
from app.models.attendance import Attendance, AttendanceStatus
from app.models.grade import AssessmentType, Grade

__all__ = [
    "Role", "User",
    "Student", "Teacher",
    "SchoolClass", "ClassEnrollment",
    "Attendance", "AttendanceStatus",
    "Grade", "AssessmentType",
]
