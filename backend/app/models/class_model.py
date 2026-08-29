"""School class and student enrollment ORM models."""

import uuid

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"
    __table_args__ = (UniqueConstraint("class_id", "student_id", name="uq_class_student"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    school_class: Mapped["SchoolClass"] = relationship("SchoolClass", back_populates="enrollments", foreign_keys=[class_id])
    student: Mapped["Student"] = relationship("Student", back_populates="enrollments", foreign_keys=[student_id])


class SchoolClass(Base):
    __tablename__ = "classes"
    __table_args__ = (UniqueConstraint("grade_level", "section", "academic_year", name="uq_grade_section_year"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    class_name: Mapped[str] = mapped_column(String(100), nullable=False)
    grade_level: Mapped[str] = mapped_column(String(20), nullable=False)
    section: Mapped[str] = mapped_column(String(20), nullable=False)
    room_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False)

    teacher_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True, index=True)
    class_head_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True, index=True)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    teacher: Mapped["Teacher"] = relationship("Teacher", back_populates="classes", foreign_keys=[teacher_id])
    class_head: Mapped["Teacher"] = relationship("Teacher", back_populates="headed_classes", foreign_keys=[class_head_id])
    teacher_assignments: Mapped[list["TeacherAssignment"]] = relationship("TeacherAssignment", back_populates="school_class", cascade="all, delete-orphan")
    enrollments: Mapped[list[ClassEnrollment]] = relationship("ClassEnrollment", back_populates="school_class", cascade="all, delete-orphan", foreign_keys=[ClassEnrollment.class_id])
    students: Mapped[list["Student"]] = relationship("Student", secondary="class_enrollments", viewonly=True, lazy="select")
    attendance_records: Mapped[list["Attendance"]] = relationship("Attendance", back_populates="school_class", cascade="all, delete-orphan", lazy="select")
    grades: Mapped[list["Grade"]] = relationship("Grade", back_populates="school_class", cascade="all, delete-orphan", lazy="select")

    def __repr__(self) -> str:
        return f"<SchoolClass {self.class_name!r} grade={self.grade_level} section={self.section}>"
