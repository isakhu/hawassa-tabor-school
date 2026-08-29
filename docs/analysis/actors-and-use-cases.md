# EduCore Actors and Use Cases

## Primary Actors

### Administrator

- Authenticate
- Manage users
- Manage students
- Manage teachers
- Manage classes
- Review academic information

### Teacher

- Authenticate
- View assigned academic information
- Manage attendance where authorized
- Record and review grades where authorized

### Student

- Authenticate
- View permitted personal academic information
- View grades and attendance where authorized

## Core Use Cases

1. Authenticate user
2. Manage student
3. Manage teacher
4. Manage class
5. Enroll student in class
6. Record attendance
7. Review attendance
8. Record grade
9. Review academic results
10. Operate the system through the web dashboard

## Analysis Notes

The use cases separate system responsibilities by actor and provide the basis for the API authorization model and frontend navigation. Authorization is treated as a system rule rather than only a user-interface restriction.
