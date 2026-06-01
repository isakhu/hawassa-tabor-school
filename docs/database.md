# Database Documentation

## Overview
The system uses **PostgreSQL** as its primary relational database.
ORM: **SQLAlchemy** (async) with **Alembic** for migrations.

## Tables

| Table         | Description                                      |
|---------------|--------------------------------------------------|
| users         | Core user accounts (all roles)                   |
| students      | Student-specific profile data                    |
| teachers      | Teacher-specific profile data                    |
| classes       | Class/course definitions                         |
| enrollments   | Join table: students ↔ classes (many-to-many)    |
| attendance    | Per-student, per-class attendance records        |
| grades        | Grade entries per student per class              |
| announcements | School-wide announcements                        |

## Entity Relationships
- A **User** has one **Student** or one **Teacher** profile (based on role)
- A **Teacher** teaches many **Classes**
- A **Student** enrolls in many **Classes** (via enrollments join table)
- A **Class** has many **Attendance** records and many **Grades**

<!-- ERD diagram will be added here during implementation -->
