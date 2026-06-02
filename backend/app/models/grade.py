"""
Grade ORM Model
Defines the `grades` table.

One row = one assessment score for one student in one class.
The grade_letter is auto-calculated from score using the grading utility.

Relationships:
  grades → students   (many-to-one)
  grades → classes    (many-to-one)
  grades → users      (many-to-one, the teacher who submitted it)
"""

import enum
import uuid

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.grading import calculate_grade_letter


# ---------------------------------------------------------------------------
# Assessment type enum
# ---------------------------------------------------------------------------

class AssessmentType(str, enum.Enum):
    EXAM       = "EXAM"
    QUIZ       = "QUIZ"
    ASSIGNMENT = "ASSIGNMENT"
    PROJECT    = "PROJECT"


# ---------------------------------------------------------------------------
# Grade model
# ---------------------------------------------------------------------------

class Grade(Base):
    __tablename__ = "grades"

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

    graded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="User (teacher/admin) who submitted this grade",
    )

    # ── Grade fields ──────────────────────────────────────────────────────
    assessment_type: Mapped[AssessmentType] = mapped_column(
        Enum(AssessmentType, name="assessment_type_enum", create_type=True),
        nullable=False,
    )

    term: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="e.g. Fall 2024, Q1, Semester 1",
    )

    score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="The student's numeric score (0–max_score)",
    )

    max_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=100,
        comment="The maximum possible score for this assessment",
    )

    grade_letter: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        comment="Auto-calculated letter grade (A+, B-, F, etc.)",
    )

    comments: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
        comment="Optional teacher feedback",
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
        back_populates="grades",
        lazy="select",
    )

    school_class: Mapped["SchoolClass"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "SchoolClass",
        back_populates="grades",
        lazy="select",
    )

    grader: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[graded_by],
        lazy="select",
    )

    # ── Helpers ───────────────────────────────────────────────────────────
    def calculate_percentage(self) -> float:
        """Return the score as a percentage (0–100)."""
        if self.max_score == 0:
            return 0.0
        return round((self.score / self.max_score) * 100, 2)

    def update_grade_letter(self) -> None:
        """
        Recalculate and set grade_letter from the current score/max_score.
        Call this after any score update.
        """
        percentage = self.calculate_percentage()
        self.grade_letter = calculate_grade_letter(percentage)

    def __repr__(self) -> str:
        return (
            f"<Grade student={self.student_id} "
            f"class={self.class_id} score={self.score}/{self.max_score} "
            f"letter={self.grade_letter}>"
        )
