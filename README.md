# Hawassa Tabor Primary and Secondary School — Management System

A full-stack school management platform built with **Next.js 14, TypeScript, FastAPI, SQLAlchemy async, and PostgreSQL**.

## School

**Hawassa Tabor Primary and Secondary School**

## Core Features

- **Authentication & RBAC** — protected workflows for Admin, Teacher, and Student roles
- **Admin Dashboard** — real student, teacher, and class statistics
- **Student Management** — create, read, update and delete student records
- **Teacher Management** — teacher records with subject and department information
- **Class Management** — classes, details, teacher assignments, and student enrollment
- **Attendance** — Present/Late/Absent tracking, summaries, and reporting
- **Grades** — teacher entry, submission, class-head review, approval, and reports
- **Final Results** — approved-subject final result calculation with PDF download
- **Responsive UI** — Next.js App Router interface for desktop and mobile

## Roles

| Role | Access |
|---|---|
| **Admin / Manager** | Full system management and academic administration |
| **Teacher** | Assigned classes, attendance, and grades |
| **Class Head** | Review/approve assigned class grades and manage class students/attendance |
| **Student** | Own profile, approved grades, attendance, final result, and PDF |

## Result Workflow

```text
Subject Teacher
      ↓
Enter Grade
      ↓
Submit Grade
      ↓
Class Head Reviews
      ↓
Approve / Return
      ↓
All Required Subjects Approved
      ↓
Student Final Result
      ↓
Download PDF
```

The final result uses the configured curriculum for the student's grade and academic year. A final result is not released until the required subjects have approved grades.

## Final Result PDF

The PDF includes:

- Hawassa Tabor Primary and Secondary School
- Student name
- Student number
- Grade
- Section
- Academic year
- Every required subject
- Subject average
- Subject letter grade
- Total
- Overall average
- Overall grade

The result format is a **high-school result**, not a university GPA calculation.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy async, Pydantic |
| Database | PostgreSQL + asyncpg |
| Authentication | JWT + bcrypt with SHA-256 pre-hashing |
| Source Control | Git / GitHub |

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Access to the PostgreSQL database configured in `backend/.env`

### Backend

From the repository root:

```powershell
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

During local development, API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

Set the frontend API endpoint with:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

Do not commit `.env`, `.env.local`, or other secret files.

## Manager Demo Account

For the local/demo environment the configured manager account is:

```text
Username: yzak
Password: 0800
```

Passwords are treated as digit strings so values such as `0800` keep their leading zeros.

## Project Structure

```text
hawassa-tabor-school/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
└── docs/
```

## Deployment

Deployment configuration is intentionally kept separate from the application source. The repository no longer contains the old Render service blueprint, Render keep-alive workflow, or Render Procfile.

For a fresh deployment, configure the hosting platform's environment variables explicitly rather than relying on a stale deployment URL stored in the codebase.

## Development Documentation

- `INTERNSHIP_DEVELOPMENT.md` — internship development record
- `docs/requirements/` — functional and non-functional requirements
- `docs/architecture/` — system architecture and workflow
- `docs/testing/` — testing strategy
