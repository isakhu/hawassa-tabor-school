"""Grade ORM model and teacher/head review workflow."""
import enum
import uuid
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.utils.grading import calculate_grade_letter


class AssessmentType(str, enum.Enum):
    EXAM = "EXAM"
    QUIZ = "QUIZ"
    ASSIGNMENT = "ASSIGNMENT"
    PROJECT = "PROJECT"


class GradeStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    RETURNED = "RETURNED"
    APPROVED = "APPROVED"


class Grade(Base):
    __tablename__ = "grades"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False, index=True)
    graded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assessment_type: Mapped[AssessmentType] = mapped_column(Enum(AssessmentType, name="assessment_type_enum", create_type=True), nullable=False)
    status: Mapped[GradeStatus] = mapped_column(Enum(GradeStatus, name="grade_status_enum", create_type=True), default=GradeStatus.DRAFT, nullable=False, index=True)
    term: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    grade_letter: Mapped[str] = mapped_column(String(3), nullable=False)
    comments: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    review_comment: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    student: Mapped["Student"] = relationship("Student", back_populates="grades", lazy="select")
    school_class: Mapped["SchoolClass"] = relationship("SchoolClass", back_populates="grades", lazy="select")
    subject: Mapped["Subject"] = relationship("Subject", lazy="select")
    grader: Mapped["User"] = relationship("User", foreign_keys=[graded_by], lazy="select")
    reviewer: Mapped["User"] = relationship("User", foreign_keys=[reviewed_by], lazy="select")

    def calculate_percentage(self) -> float:
        if self.max_score == 0:
            return 0.0
        return round((self.score / self.max_score) * 100, 2)

    def update_grade_letter(self) -> None:
        self.grade_letter = calculate_grade_letter(self.calculate_percentage())
