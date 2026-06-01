# Grades Routes
# This module will define endpoints for managing student grades.
# Planned endpoints:
#   POST   /grades              → submit a grade for a student in a class (teacher only)
#   GET    /grades              → list grades (filterable by student/class/term)
#   GET    /grades/{id}         → get a specific grade record
#   PUT    /grades/{id}         → update a grade entry
#   DELETE /grades/{id}         → delete a grade (admin only)
#   GET    /grades/report/{student_id} → generate a full grade report for a student
