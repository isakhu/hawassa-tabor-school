# User ORM Model
# This module will define the SQLAlchemy ORM model for the `users` table.
# Fields will include:
#   id (UUID), email (unique), hashed_password, full_name,
#   role (enum: admin | teacher | student), is_active, created_at, updated_at
# Relationships:
#   - One-to-one with Student or Teacher profile depending on role
# Will inherit from the shared declarative Base in core/database.py.
