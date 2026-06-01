# Attendance Routes
# This module will define endpoints for recording and querying attendance.
# Planned endpoints:
#   POST   /attendance                    → mark attendance for a class session
#   GET    /attendance                    → list attendance records (filterable by class/date/student)
#   GET    /attendance/{id}               → get a specific attendance record
#   PUT    /attendance/{id}               → correct an attendance entry
#   GET    /attendance/summary/{class_id} → get attendance summary/statistics for a class
