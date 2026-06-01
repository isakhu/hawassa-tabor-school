# Teacher ORM Model
# This module will define the SQLAlchemy ORM model for the `teachers` table.
# Fields will include:
#   id (UUID), user_id (FK → users), employee_number, department,
#   qualification, hire_date, created_at
# Relationships:
#   - belongs_to User (one-to-one)
#   - has_many Classes (as the assigned teacher)
