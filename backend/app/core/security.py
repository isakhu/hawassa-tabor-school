# Security Utilities
# This module will contain all cryptographic and token-related helper functions.
# Planned functions:
#   hash_password(plain: str) -> str          → bcrypt hash a plain-text password
#   verify_password(plain, hashed) -> bool    → verify a password against its hash
#   create_access_token(data, expires) -> str → sign and return a JWT access token
#   create_refresh_token(data) -> str         → sign and return a JWT refresh token
#   decode_token(token: str) -> dict          → decode and validate a JWT, raise on failure
