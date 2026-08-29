# EduCore — School Management System

A full-stack school management platform built with **Next.js 14, TypeScript, FastAPI, SQLAlchemy async, and PostgreSQL**.

## Internship Project

| | |
|---|---|
| **Intern** | Yishak Tule |
| **Organization** | Sidama Science and Technology Agency |
| **Location** | Hawassa, Ethiopia |
| **Field** | Software Engineering |
| **Project** | EduCore — School Management System |
| **Development record** | March 2026 – June 2026 |

The repository contains the implementation of EduCore and a separate [`INTERNSHIP_DEVELOPMENT.md`](./INTERNSHIP_DEVELOPMENT.md) document that organizes the project into its four-month internship development phases.

## Live Demo
- **Backend API:** https://school-managment-system-h7mn.onrender.com
- **API Docs:** https://school-managment-system-h7mn.onrender.com/docs
- **Frontend:** Configure the deployed Vercel URL in the environment variables below.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy (async), PostgreSQL |
| Authentication | JWT (python-jose) + bcrypt (passlib) |
| Validation | Pydantic |
| Hosting | Vercel + Render + Render PostgreSQL |
| Source control | Git / GitHub |

## Core Features

- **Authentication & RBAC** — protected workflows for Admin, Teacher, and Student roles
- **Admin Dashboard** — system statistics, activity and management actions
- **Student Management** — create, read, update and delete student records
- **Teacher Management** — teacher records with subject/department information
- **Class Management** — classes, details and student enrollment
- **Attendance** — Present/Late/Absent tracking, summaries and reporting
- **Grades** — grade entry, automatic letter-grade calculation and student reports
- **Responsive UI** — modern dashboard interface built with Next.js and Tailwind CSS

## Roles

| Role | Access |
|---|---|
| Admin | Full system management |
| Teacher | Manage assigned classes, attendance and grades |
| Student | View own classes, grades and attendance |

---

## Four-Month Internship Development Structure

### March 2026 — Foundation & Architecture

Database design, PostgreSQL connectivity, asynchronous SQLAlchemy models, user/role modelling, Pydantic schemas and authentication foundation.

### April 2026 — Core API Development

Student, teacher and class management services, enrollment workflows, role-aware access control, validation and API organization.

### May 2026 — Academic Operations

Attendance, grades, academic business rules, reporting, data aggregation and backend reliability work.

### June 2026 — Frontend, Integration & Deployment

Next.js management interface, dashboard, authentication flow, management pages, academic UI, API integration, responsive refinement and deployment preparation.

> The month structure is a project-development record. Individual Git commits remain the source of truth for specific implementation changes.

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Backend

```bash
cd backend
python -m venv venv
venv\\Scripts\\activate          # Windows
pip install -r requirements.txt
cp ../.env.example .env
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

```text
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/school_db
SECRET_KEY=your-secret-key-min-32-chars
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
ENVIRONMENT=development
```

### Frontend (`frontend/.env.local`)

```text
NEXT_PUBLIC_API_URL=https://school-managment-system-h7mn.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=EduCore
```

---

## Deployment

### Backend → Render

1. Connect the repository to Render.
2. Set the root directory to `backend`.
3. Build with `pip install -r requirements.txt`.
4. Start with `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Configure the required environment variables.

### Frontend → Vercel

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Configure `NEXT_PUBLIC_API_URL`.
4. Deploy and verify the production API connection.

---

## Project Structure

```text
school-management-system/
├── backend/
│   ├── app/
│   │   ├── api/routes/       auth, students, teachers, classes, attendance, grades
│   │   ├── core/             config, database, security
│   │   ├── models/           SQLAlchemy ORM models
│   │   ├── schemas/          Pydantic schemas
│   │   └── utils/            grading utilities
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── app/                  Next.js App Router pages
    ├── components/           reusable UI components
    └── lib/                  API, authentication and constants
```

## Documentation

- [`INTERNSHIP_DEVELOPMENT.md`](./INTERNSHIP_DEVELOPMENT.md) — four-month internship development record
- Backend API documentation — available from the deployed FastAPI `/docs` endpoint
