"""
FastAPI shared dependencies.
Injected into route handlers via Depends().
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import Role, User

# ---------------------------------------------------------------------------
# Bearer token extractor
# ---------------------------------------------------------------------------

_bearer = HTTPBearer(auto_error=True)


# ---------------------------------------------------------------------------
# get_current_user
# ---------------------------------------------------------------------------

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """
    Decode the Bearer JWT and return the matching User row.
    Raises 401 if the token is invalid or the user does not exist / is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise credentials_exception

    return user


# ---------------------------------------------------------------------------
# Role guards
# ---------------------------------------------------------------------------

async def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Raise 403 if the authenticated user is not an ADMIN."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


async def require_teacher(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Raise 403 if the authenticated user is not a TEACHER or ADMIN."""
    if current_user.role not in (Role.TEACHER, Role.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher or Admin access required.",
        )
    return current_user
