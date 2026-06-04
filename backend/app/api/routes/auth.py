"""
Authentication routes.
POST /auth/login     — verify credentials and return a JWT
GET  /auth/me        — return the currently authenticated user
POST /auth/register  — ADMIN ONLY: create a new user account
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.class_model import SchoolClass
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import User, Role
from app.schemas.user import DashboardSummaryResponse, TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse, summary="Login and receive a JWT access token")
async def login(payload: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]) -> TokenResponse:
    invalid_exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.", headers={"WWW-Authenticate": "Bearer"})
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise invalid_exc
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has been deactivated.")
    access_token = create_access_token(subject=str(user.id), extra_claims={"role": user.role, "email": user.email})
    return TokenResponse(access_token=access_token, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse, summary="Get the currently authenticated user")
async def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.get(
    "/dashboard/summary",
    response_model=DashboardSummaryResponse,
    summary="Admin only: get total counts for students and active teachers"
)
async def get_dashboard_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> DashboardSummaryResponse:
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access restricted to administrators.")

    student_count = await db.scalar(
        select(func.count(Student.id))
        .join(User, Student.user_id == User.id)
        .where(User.is_active == True)
    )
    teacher_count = await db.scalar(
        select(func.count(Teacher.id))
        .join(User, Teacher.user_id == User.id)
        .where(User.is_active == True)
    )
    class_count = await db.scalar(select(func.count(SchoolClass.id)))

    return DashboardSummaryResponse(
        total_students=student_count or 0,
        active_teachers=teacher_count or 0,
        total_classes=class_count or 0
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Admin only: create a new user account")
async def register(payload: UserCreate, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can create new user accounts.")
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    user = User(full_name=payload.full_name, email=payload.email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)