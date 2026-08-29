"""User Pydantic schemas."""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from app.models.user import Role


# Passwords are kept as strings so leading zeros are preserved. They are
# restricted to non-negative whole-number digits, with no artificial length
# limit; security.hash_password() SHA-256 pre-hashes them before bcrypt.
WHOLE_NUMBER_PASSWORD = r"^\d+$"


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str
    role: Role


class UserCreate(UserBase):
    password: str = Field(..., min_length=1, pattern=WHOLE_NUMBER_PASSWORD)


class UserLogin(BaseModel):
    """Login accepts any non-empty login ID or the existing email field."""
    email: str | None = None
    login_id: str | None = None
    password: str = Field(..., min_length=1, pattern=WHOLE_NUMBER_PASSWORD)

    @model_validator(mode="after")
    def require_identifier(self):
        if not (self.email or self.login_id):
            raise ValueError("email or login_id is required")
        return self

    @property
    def identifier(self) -> str:
        return self.login_id or self.email or ""


class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class DashboardSummaryResponse(BaseModel):
    total_students: int
    active_teachers: int
    total_classes: int
