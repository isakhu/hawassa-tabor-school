"""Academic structure for EduCore.

Keeps curriculum subjects and teacher assignments separate from the core
user/class records so one class can have one head teacher and many subject
teachers.
"""
from datetime import datetime
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    curriculum_subjects: Mapped[list["CurriculumSubject"]] = relationship(back_populates="subject")
    assignments: Mapped[list["TeacherAssignment"]] = relationship(back_populates="subject")


class CurriculumSubject(Base):
    __tablename__ = "curriculum_subjects"
    __table_args__ = (UniqueConstraint("grade_level", "subject_id", "academic_year", name="uq_curriculum_grade_subject_year"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    grade_level: Mapped[int] = mapped_column(nullable=False, index=True)
    subject_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    subject: Mapped[Subject] = relationship(back_populates="curriculum_subjects")


class TeacherAssignment(Base):
    __tablename__ = "teacher_assignments"
    __table_args__ = (
        UniqueConstraint("teacher_id", "class_id", "subject_id", "academic_year", name="uq_teacher_class_subject_year"),
        UniqueConstraint("class_id", "subject_id", "academic_year", name="uq_class_subject_year"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    teacher_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    teacher: Mapped["Teacher"] = relationship(back_populates="assignments")
    school_class: Mapped["SchoolClass"] = relationship(back_populates="teacher_assignments")
    subject: Mapped[Subject] = relationship(back_populates="assignments")
