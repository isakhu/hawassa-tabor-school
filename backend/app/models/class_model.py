"""
Class ORM Model
Defines the `classes` table and the `class_enrollments` join table.

Relationships:
  classes  ←→  teachers        many-to-one  (one teacher owns many classes)
  classes  ←→  students        many-to-many (via class_enrollments join table)

Named class_model.py to avoid shadowing Python's built-in `class` keyword.
"""

import uuid

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ---------------------------------------------------------------------------
# Join table — class_enrollments
# Stores which students are enrolled in which classes.
# ---------------------------------------------------------------------------

class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"

    __table_args__ = (
        UniqueConstraint("class_id", "student_id", name="uq_class_student"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("classes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    enrolled_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────
    school_class: Mapped["SchoolClass"] = relationship(
        "SchoolClass",
        back_populates="enrollments",
    )
    student: Mapped["Student"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Student",
        back_populates="enrollments",
    )

    def __repr__(self) -> str:
        return f"<ClassEnrollment class={self.class_id} student={self.student_id}>"


# ---------------------------------------------------------------------------
# SchoolClass model
# Named SchoolClass to avoid clashing with Python's built-in class keyword.
# ---------------------------------------------------------------------------

class SchoolClass(Base):
    __tablename__ = "classes"

    # ── Primary key ───────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # ── Identity ──────────────────────────────────────────────────────────
    class_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="e.g. Mathematics 10A, Physics Advanced",
    )

    grade_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="e.g. Grade 10, Form 3",
    )

    section: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="e.g. A, B, Red",
    )

    room_number: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="Physical room or online meeting link",
    )

    academic_year: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="e.g. 2024-2025",
    )

    # ── FK → teachers ─────────────────────────────────────────────────────
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("teachers.id", ondelete="SET NULL"),
        nullable=True,   # nullable so a class can exist without a teacher assigned
        index=True,
    )

    # ── Timestamps ────────────────────────────────────────────────────────
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────
    teacher: Mapped["Teacher"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Teacher",
        back_populates="classes",
    )

    enrollments: Mapped[list["ClassEnrollment"]] = relationship(
        "ClassEnrollment",
        back_populates="school_class",
        cascade="all, delete-orphan",
    )

    # Convenience accessor — goes through the join table
    students: Mapped[list["Student"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Student",
        secondary="class_enrollments",
        viewonly=True,          # mutations go through ClassEnrollment directly
        lazy="select",
    )

    # Attendance records for this class
    attendance_records: Mapped[list["Attendance"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Attendance",
        back_populates="school_class",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # Grade records for this class
    grades: Mapped[list["Grade"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Grade",
        back_populates="school_class",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<SchoolClass {self.class_name!r} "
            f"grade={self.grade_level} section={self.section}>"
        )
