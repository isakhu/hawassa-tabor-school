"""Teacher ORM Model."""

import uuid

from sqlalchemy import Date, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    teacher_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    subject_specialization: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    hire_date: Mapped[Date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="teacher_profile")
    classes: Mapped[list["SchoolClass"]] = relationship("SchoolClass", back_populates="teacher")
    headed_classes: Mapped[list["SchoolClass"]] = relationship("SchoolClass", back_populates="class_head", foreign_keys="SchoolClass.class_head_id")
    assignments: Mapped[list["TeacherAssignment"]] = relationship("TeacherAssignment", back_populates="teacher", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Teacher number={self.teacher_number!r} subject={self.subject_specialization!r}>"
