# Grade Pydantic Schemas
# This module will define request/response schemas for grade-related endpoints.
# Planned schemas:
#   GradeBase         → shared fields (score, max_score, assessment_type, term, comments)
#   GradeCreate       → GradeBase + student_id, class_id
#   GradeUpdate       → optional fields for partial updates
#   GradeResponse     → GradeBase + id, letter_grade, graded_by, created_at
#   GradeReportItem   → aggregated grade summary per class/term for a student
