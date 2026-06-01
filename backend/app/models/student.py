# Student ORM Model
# This module will define the SQLAlchemy ORM model for the `students` table.
# Fields will include:
#   id (UUID), user_id (FK → users), student_number, date_of_birth,
#   grade_level, guardian_name, guardian_contact, enrollment_date, created_at
# Relationships:
#   - belongs_to User (one-to-one)
#   - has_many Grades
#   - has_many Attendance records
#   - many_to_many Classes (via enrollment join table)
