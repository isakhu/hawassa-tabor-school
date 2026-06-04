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
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001,https://school-managment-system-flax.vercel.app,https://school-managment-system5.vercel.app"

    # ── App ───────────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"

    # ── Default Admin Credentials (hardcoded) ─────────────────────────────
    # These are the ONLY credentials that work on first launch.
    # Change these values to your desired admin username/password.
    # After first login, admin can create all other users inside the app.
    ADMIN_EMAIL: str = "yzak"
    ADMIN_PASSWORD: str = "0800"
    ADMIN_FULL_NAME: str = "Super Admin"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_set(cls, v: str, info) -> str:
        """Refuse to start in production with the default placeholder key."""
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