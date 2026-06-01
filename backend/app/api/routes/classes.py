# Classes Routes
# This module will define CRUD endpoints for class/course management.
# Planned endpoints:
#   GET    /classes              → list all classes
#   POST   /classes              → create a new class (admin only)
#   GET    /classes/{id}         → get class details including enrolled students
#   PUT    /classes/{id}         → update class information
#   DELETE /classes/{id}         → delete a class
#   POST   /classes/{id}/enroll  → enroll a student in a class
#   DELETE /classes/{id}/enroll/{student_id} → remove a student from a class
