"""
Attendance ORM Model
Defines the `attendance` table.

One row = one student's attendance record for one class on one date.
The UNIQUE constraint on (student_id, class_id, date) prevents duplicates.

Relationships:
  attendance → students   (many-to-one)
  attendance → classes    (many-to-one)
  attendance → users      (many-to-one, the staff member who recorded it)
"""

import enum
import uuid

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ---------------------------------------------------------------------------
# Attendance status enum
# ---------------------------------------------------------------------------

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT  = "ABSENT"
    LATE    = "LATE"


# ---------------------------------------------------------------------------
# Attendance model
# ---------------------------------------------------------------------------

class Attendance(Base):
    __tablename__ = "attendance"

    __table_args__ = (
        # One attendance record per student per class per day
        UniqueConstraint(
            "student_id", "class_id", "date",
            name="uq_attendance_student_class_date",
        ),
    )

    # ── Primary key ───────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # ── FKs ───────────────────────────────────────────────────────────────
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("classes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    recorded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="User (teacher/admin) who marked this attendance",
    )

    # ── Attendance fields ─────────────────────────────────────────────────
    date: Mapped[Date] = mapped_column(
        Date,
        nullable=False,
        index=True,
        comment="Calendar date of the class session",
    )

    status: Mapped[AttendanceStatus] = mapped_column(
        Enum(AttendanceStatus, name="attendance_status_enum", create_type=True),
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Optional note, e.g. 'Left early', 'Medical excuse'",
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
    student: Mapped["Student"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Student",
        back_populates="attendance_records",
        lazy="select",
    )

    school_class: Mapped["SchoolClass"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "SchoolClass",
        back_populates="attendance_records",
        lazy="select",
    )

    recorder: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[recorded_by],
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<Attendance student={self.student_id} "
            f"class={self.class_id} date={self.date} status={self.status}>"
        )
