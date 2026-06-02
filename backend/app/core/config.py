"""
Application configuration.
Loads and validates all environment variables using Pydantic BaseSettings.

In development: values come from backend/.env
In production:  values come from platform environment variables (Render / Railway)
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── Security ──────────────────────────────────────────────────────────
    SECRET_KEY: str = "changeme"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ──────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── App ───────────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_set(cls, v: str, info) -> str:
        """Refuse to start in production with the default placeholder key."""
        # info.data may not have ENVIRONMENT yet during validation order,
        # so we read it directly from the raw value.
        if v == "changeme":
            import os
            env = os.getenv("ENVIRONMENT", "development")
            if env == "production":
                raise ValueError(
                    "SECRET_KEY must be set to a secure value in production. "
                    "Generate one with: openssl rand -hex 32"
                )
        return v

    @property
    def allowed_origins_list(self) -> list[str]:
        """Return ALLOWED_ORIGINS as a Python list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


# Singleton — import this everywhere instead of re-instantiating.
settings = Settings()
