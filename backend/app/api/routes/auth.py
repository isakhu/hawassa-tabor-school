# Authentication Routes
# This module will define all authentication-related API endpoints.
# Planned endpoints:
#   POST /auth/login    → validate credentials, return JWT access + refresh tokens
#   POST /auth/logout   → invalidate the refresh token
#   POST /auth/refresh  → exchange a valid refresh token for a new access token
#   POST /auth/me       → return the currently authenticated user's profile
# Will use OAuth2PasswordRequestForm and JWT utilities from core/security.py.
