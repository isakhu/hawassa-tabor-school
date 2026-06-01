# Student Pydantic Schemas
# This module will define request/response schemas for student-related endpoints.
# Planned schemas:
#   StudentBase         → shared fields (student_number, grade_level, guardian info)
#   StudentCreate       → StudentBase + user_id
#   StudentUpdate       → optional fields for partial updates
#   StudentResponse     → StudentBase + id, user details, enrollment_date
#   StudentListResponse → paginated list of StudentResponse
