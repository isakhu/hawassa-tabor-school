# Class ORM Model
# This module will define the SQLAlchemy ORM model for the `classes` table.
# Named class_model.py to avoid conflict with Python's built-in `class` keyword.
# Fields will include:
#   id (UUID), name, subject, teacher_id (FK → teachers),
#   room_number, schedule, academic_year, created_at
# Relationships:
#   - belongs_to Teacher
#   - many_to_many Students (via enrollment join table)
#   - has_many Attendance records
#   - has_many Grades
