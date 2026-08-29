"""
Application configuration.
Loads and validates environment variables using Pydantic BaseSettings.

Development values may come from backend/.env.
Production values must be supplied by the hosting environment.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str = "changeme"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # Application
    ENVIRONMENT: str = "development"
    DEMO_SEED_DATA: bool = False

    # Initial administrator credentials.
    # Development defaults are retained for local setup only.
    ADMIN_EMAIL: str = "yzak"
    ADMIN_PASSWORD: str = "0800"
    ADMIN_FULL_NAME: str = "Tabor Admin"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_set(cls, v: str, info) -> str:
        if v == "changeme":
            import os
            env = os.getenv("ENVIRONMENT", "development")
            if env == "production":
                raise ValueError(
                    "SECRET_KEY must be set to a secure value in production."
                )
        return v

    @property
    def allowed_origins_list(self) -> list[str]:
        """Return configured CORS origins without empty values."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()
