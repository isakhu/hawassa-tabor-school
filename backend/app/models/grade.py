# Grade ORM Model
# This module will define the SQLAlchemy ORM model for the `grades` table.
# Fields will include:
#   id (UUID), student_id (FK → students), class_id (FK → classes),
#   term, assessment_type (enum: exam | quiz | assignment | project),
#   score, max_score, letter_grade, comments, graded_by (FK → users), created_at
# Relationships:
#   - belongs_to Student
#   - belongs_to Class
#   - belongs_to User (the teacher who submitted the grade)
