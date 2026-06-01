# FastAPI Dependencies
# This module will define reusable dependency injection functions used across routes.
# Planned dependencies:
#   get_db()              → yield a SQLAlchemy database session per request
#   get_current_user()    → decode JWT, fetch and return the authenticated User object
#   require_admin()       → raise 403 if the current user is not an admin
#   require_teacher()     → raise 403 if the current user is not a teacher or admin
#   get_pagination()      → parse and return page/page_size query params
