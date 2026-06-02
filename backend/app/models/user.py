"""
User ORM Model
Defines the `users` table — the central identity table for all roles.
Every Admin, Teacher, and Student has exactly one row here.
"""

import enum
import uuid

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ---------------------------------------------------------------------------
# Role enum
# ---------------------------------------------------------------------------

class Role(str, enum.Enum):
    """
    Application-level roles.
    Inheriting from str makes the enum JSON-serialisable
    and compatible with Pydantic without extra validators.
    """
    ADMIN = "ADMIN"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"


# ---------------------------------------------------------------------------
# User model
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    # ── Primary key ───────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # ── Identity fields ───────────────────────────────────────────────────
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # ── Role ──────────────────────────────────────────────────────────────
    role: Mapped[Role] = mapped_column(
        Enum(Role, name="role_enum", create_type=True),
        nullable=False,
    )

    # ── Status ────────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        server_default="true",
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

    # ── Relationships (stubs — populated when child models are created) ───
    # One-to-one: User → Student profile
    student_profile: Mapped["Student"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Student",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="select",
    )

    # One-to-one: User → Teacher profile
    teacher_profile: Mapped["Teacher"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Teacher",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ── Helpers ───────────────────────────────────────────────────────────
    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"
