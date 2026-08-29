# EduCore Functional Requirements

**Intern:** Yishak Tule  
**Organization:** Sidam Science and Technology Agency  
**Location:** Hawassa, Ethiopia  
**Project:** EduCore — School Management System

## 1. User and Access Management

- Administrators can authenticate securely.
- The system supports role-aware access for administrative, teaching, and student users.
- Authenticated users can access protected resources according to their permissions.

## 2. Student Management

- Authorized users can create, view, update, and manage student records.
- Student records can be searched and filtered.
- Student enrollment can be associated with classes.

## 3. Teacher Management

- Authorized users can create and manage teacher records.
- Teacher information can be associated with academic responsibilities.

## 4. Class Management

- Authorized users can create and manage classes.
- Students can be enrolled in and removed from classes.
- Class information can expose enrolled students where permitted.

## 5. Attendance

- Teachers/authorized users can record attendance.
- Attendance records can be retrieved for students and classes.
- Attendance information can support reporting and filtering.

## 6. Grades

- Authorized users can record academic grades.
- Grades are associated with students and academic subjects/classes.
- Grade information can be retrieved for reporting.

## 7. API and Frontend Integration

- The frontend communicates with the FastAPI backend through HTTP APIs.
- API validation and error responses are surfaced appropriately in the frontend.

## 8. Deployment and Operations

- The backend and frontend can be configured independently through environment variables.
- Production configuration must not depend on development demo data.
