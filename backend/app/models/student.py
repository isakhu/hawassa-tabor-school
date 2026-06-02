"""
Student ORM Model
Defines the `students` table — the profile table for users with role=STUDENT.
Linked one-to-one to the `users` table via user_id.
"""

import uuid

from sqlalchemy import Date, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    # ── Primary key ───────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # ── FK → users ────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,          # enforces one-to-one
        nullable=False,
        index=True,
    )

    # ── School identity ───────────────────────────────────────────────────
    student_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique school-assigned student ID, e.g. STU-2024-001",
    )

    # ── Academic placement ────────────────────────────────────────────────
    grade_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="e.g. Grade 10, Form 3, Year 2",
    )

    section: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="e.g. A, B, Red, Blue",
    )

    # ── Personal details ──────────────────────────────────────────────────
    date_of_birth: Mapped[Date | None] = mapped_column(
        Date,
        nullable=True,
    )

    guardian_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    guardian_contact: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # ── Timestamps ────────────────────────────────────────────────────────
    enrollment_date: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

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
    # Many-side of the one-to-one back to User
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        back_populates="student_profile",
    )

    # Student enrollments (via join table)
    enrollments: Mapped[list["ClassEnrollment"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "ClassEnrollment",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # Attendance records for this student
    attendance_records: Mapped[list["Attendance"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Attendance",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # Grade records for this student
    grades: Mapped[list["Grade"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Grade",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Student number={self.student_number!r} grade={self.grade_level} section={self.section}>"
