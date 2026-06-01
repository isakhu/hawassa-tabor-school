# Users Routes
# This module will define CRUD endpoints for user management (admin-only).
# Planned endpoints:
#   GET    /users        → list all users with pagination and role filtering
#   POST   /users        → create a new user account
#   GET    /users/{id}   → retrieve a single user by ID
#   PUT    /users/{id}   → update user details
#   DELETE /users/{id}   → soft-delete a user account
# Access restricted to admin role via dependency injection.
