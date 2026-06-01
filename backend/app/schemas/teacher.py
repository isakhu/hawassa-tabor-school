# Teacher Pydantic Schemas
# This module will define request/response schemas for teacher-related endpoints.
# Planned schemas:
#   TeacherBase         → shared fields (employee_number, department, qualification)
#   TeacherCreate       → TeacherBase + user_id
#   TeacherUpdate       → optional fields for partial updates
#   TeacherResponse     → TeacherBase + id, user details, hire_date
#   TeacherListResponse → paginated list of TeacherResponse
