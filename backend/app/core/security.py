"""
Security utilities.
Handles password hashing (bcrypt) and JWT token creation / verification.

Password hashing uses SHA-256 pre-hashing before bcrypt so passwords of any
length are supported without relying on bcrypt's 72-byte input limitation.
Existing legacy Passlib/bcrypt hashes remain verifiable and are transparently
supported during migration.
"""

import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# Suppress noisy bcrypt/passlib compatibility warnings from environments that
# still have Passlib installed for legacy dependencies.
logging.getLogger("passlib").setLevel(logging.ERROR)

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

_LEGACY_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2y$")
_NEW_BCRYPT_PREFIX = "$bcrypt-sha256$"


def _prehash_password(plain: str) -> bytes:
    """Convert any Unicode password into a fixed-size bcrypt-safe digest."""
    return hashlib.sha256(plain.encode("utf-8")).digest()


def hash_password(plain: str) -> str:
    """Hash a password safely regardless of its length."""
    digest = _prehash_password(plain)
    encoded = bcrypt.hashpw(digest, bcrypt.gensalt()).decode("ascii")
    return f"{_NEW_BCRYPT_PREFIX}{encoded}"


def _legacy_safe_password(plain: str) -> bytes:
    """Prepare a legacy bcrypt password using bcrypt's historical 72-byte rule."""
    raw = plain.encode("utf-8")
    return raw[:72]


def verify_password(plain: str, hashed: str) -> bool:
    """Verify both new SHA-256+bcrypt hashes and legacy bcrypt hashes."""
    try:
        if hashed.startswith(_NEW_BCRYPT_PREFIX):
            bcrypt_hash = hashed[len(_NEW_BCRYPT_PREFIX):].encode("ascii")
            return bcrypt.checkpw(_prehash_password(plain), bcrypt_hash)

        if hashed.startswith(_LEGACY_BCRYPT_PREFIXES):
            return bcrypt.checkpw(_legacy_safe_password(plain), hashed.encode("ascii"))

        return False
    except (ValueError, TypeError, UnicodeEncodeError):
        return False


# ---------------------------------------------------------------------------
# JWT tokens
# ---------------------------------------------------------------------------

ALGORITHM = "HS256"


def create_access_token(subject: str | Any, extra_claims: dict | None = None) -> str:
    """Create a signed JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload: dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token."""
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("type") != "access":
        raise JWTError("Invalid token type")
    return payload
