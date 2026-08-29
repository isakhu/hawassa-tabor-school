"""User Pydantic schemas."""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from app.models.user import Role

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str
    role: Role

class UserCreate(UserBase):
    password: str = Field(..., min_length=1, max_length=128)

class UserLogin(BaseModel):
    """Login accepts the generated login ID or the existing email field."""
    email: str | None = None
    login_id: str | None = None
    password: str = Field(..., min_length=1, max_length=128)

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
