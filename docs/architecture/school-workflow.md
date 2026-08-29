# EduCore School Workflow

## Roles

### School Manager (ADMIN)
- Register teacher accounts.
- Create Grades 1–12 and sections (A, B, C, ...).
- Assign exactly one class head to each class.
- Configure the applicable curriculum by academic year.
- Assign one subject teacher to each class/subject combination.
- Monitor students, teachers, classes, attendance and academic results.

### Class Head (TEACHER)
- View only classes they head.
- Register students into their own class.
- Receive generated student credentials.
- Record class attendance.
- Review submitted subject grades.
- Approve or return grade submissions.

### Subject Teacher (TEACHER)
- View only manager-created class/subject assignments.
- Enter grades for students enrolled in the assigned class.
- Submit grades to the class head for review.
- Correct returned grades and resubmit.

### Student (STUDENT)
- Sign in using school-issued credentials.
- View their own profile, enrollment, attendance and approved academic results.

## Grade 10B example

A class has one class head but may have many subject teachers:

```text
Grade 10B
  Class Head: Teacher A

  Mathematics -> Teacher B
  Physics    -> Teacher C
  Chemistry  -> Teacher D
  Biology    -> Teacher E
  ...
```

The class head is responsible for the class-level attendance workflow. Subject teachers are responsible for the subjects assigned to them.

## Grade submission state

```text
DRAFT -> SUBMITTED -> CLASS HEAD REVIEW
                         |          |
                         |          +-> RETURNED -> Teacher correction
                         |
                         +-> APPROVED
```

Approved grades should be treated as final unless an authorized administrative correction workflow is added.

## Data relationships

```text
Academic Year
   |
   +-- Grade 1..12
          |
          +-- Section (A, B, C, ...)
                 |
                 +-- One Class Head
                 +-- Curriculum Subjects
                 +-- Teacher Assignments
                 +-- Student Enrollments
                        |
                        +-- Attendance
                        +-- Grades
```

The application stores these relationships in PostgreSQL through SQLAlchemy. Normal school operations should occur through the application/API instead of direct database editing.
