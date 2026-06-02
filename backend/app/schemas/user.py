"""
User Pydantic schemas.
Defines the shapes of request bodies and response payloads for user-related endpoints.
Password is NEVER included in response schemas.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import Role


# ---------------------------------------------------------------------------
# Shared base
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@school.edu"])
    role: Role = Field(..., examples=[Role.STUDENT])


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class UserCreate(UserBase):
    """Used for POST /auth/register — includes plain-text password."""
    password: str = Field(..., min_length=8, max_length=128, examples=["Str0ngPass!"])

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Enforce at least one digit and one letter."""
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        if not (has_letter and has_digit):
            raise ValueError("Password must contain at least one letter and one digit.")
        return v


class UserLogin(BaseModel):
    """Used for POST /auth/login."""
    email: EmailStr = Field(..., examples=["jane@school.edu"])
    password: str = Field(..., examples=["Str0ngPass!"])


# ---------------------------------------------------------------------------
# Response schemas  (password fields are intentionally absent)
# ---------------------------------------------------------------------------

class UserResponse(UserBase):
    """Returned from register and profile endpoints."""
    id: uuid.UUID
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Returned from login endpoint."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int          # seconds until expiry
    user: UserResponse
