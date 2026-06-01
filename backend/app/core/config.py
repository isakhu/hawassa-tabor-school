# Application Configuration
# This module will use Pydantic BaseSettings to load and validate all
# environment variables required by the application.
# Settings will include:
#   - DATABASE_URL: PostgreSQL connection string
#   - SECRET_KEY: secret used to sign JWT tokens
#   - ACCESS_TOKEN_EXPIRE_MINUTES: JWT access token TTL
#   - REFRESH_TOKEN_EXPIRE_DAYS: JWT refresh token TTL
#   - ALLOWED_ORIGINS: list of CORS-allowed frontend origins
#   - ENVIRONMENT: "development" | "staging" | "production"
# A singleton `settings` instance will be exported for use throughout the app.
