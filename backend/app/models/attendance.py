# Attendance ORM Model
# This module will define the SQLAlchemy ORM model for the `attendance` table.
# Fields will include:
#   id (UUID), student_id (FK → students), class_id (FK → classes),
#   date, status (enum: present | absent | late | excused),
#   notes, recorded_by (FK → users), created_at
# Relationships:
#   - belongs_to Student
#   - belongs_to Class
#   - belongs_to User (the teacher who recorded it)
