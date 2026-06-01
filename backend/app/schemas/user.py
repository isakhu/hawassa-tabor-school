# User Pydantic Schemas
# This module will define request/response schemas for user-related endpoints.
# Planned schemas:
#   UserBase         → shared fields (email, full_name, role)
#   UserCreate       → UserBase + password
#   UserUpdate       → optional fields for partial updates
#   UserResponse     → UserBase + id, is_active, created_at (no password)
#   UserListResponse → paginated list of UserResponse
