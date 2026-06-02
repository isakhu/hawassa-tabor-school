"""
Teacher ORM Model
Defines the `teachers` table — the profile table for users with role=TEACHER.
Linked one-to-one to the `users` table via user_id.
"""

import uuid

from sqlalchemy import Date, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

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
    teacher_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique school-assigned staff ID, e.g. TCH-2024-001",
    )

    # ── Professional details ──────────────────────────────────────────────
    subject_specialization: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Primary subject the teacher is qualified to teach",
    )

    department: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="e.g. Science, Mathematics, Languages",
    )

    phone_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    hire_date: Mapped[Date | None] = mapped_column(
        Date,
        nullable=True,
        comment="Date the teacher was officially hired",
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
    # Many-side of the one-to-one back to User
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        back_populates="teacher_profile",
    )

    # One teacher → many classes
    classes: Mapped[list["SchoolClass"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "SchoolClass",
        back_populates="teacher",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<Teacher number={self.teacher_number!r} "
            f"subject={self.subject_specialization!r}>"
        )
