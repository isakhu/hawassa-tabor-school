"""
Application configuration.
Loads and validates environment variables using Pydantic BaseSettings.

Development values may come from backend/.env.
Production values must be supplied by the hosting environment.
"""

import os

from pydantic import field_validator, model_validator
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
            env = os.getenv("ENVIRONMENT", "development").lower()
            if env == "production":
                raise ValueError("SECRET_KEY must be set to a secure value in production.")
        return v

    @model_validator(mode="after")
    def production_credentials_must_be_explicit(self):
        if self.is_production:
            if self.ADMIN_EMAIL == "yzak" or self.ADMIN_PASSWORD == "0800":
                raise ValueError(
                    "ADMIN_EMAIL and ADMIN_PASSWORD must be changed from development defaults in production."
                )
            if len(self.ADMIN_PASSWORD) < 12:
                raise ValueError("ADMIN_PASSWORD must contain at least 12 characters in production.")
        return self

    @field_validator("ACCESS_TOKEN_EXPIRE_MINUTES")
    @classmethod
    def access_token_expiry_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be greater than zero.")
        return v

    @field_validator("REFRESH_TOKEN_EXPIRE_DAYS")
    @classmethod
    def refresh_token_expiry_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("REFRESH_TOKEN_EXPIRE_DAYS must be greater than zero.")
        return v

    @property
    def allowed_origins_list(self) -> list[str]:
        """Return configured CORS origins without empty values."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()
