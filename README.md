# EduCore — School Management System

A full-stack school management platform built with Next.js 14 and FastAPI.

## Live Demo
- **Frontend:** https://your-new-app-name.vercel.app
- **Backend API:** https://school-managment-system-h7mn.onrender.com
- **API Docs:** https://school-managment-system-h7mn.onrender.com/docs

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend   | FastAPI, SQLAlchemy (async), PostgreSQL |
| Auth      | JWT (python-jose) + bcrypt (passlib) |
| Hosting   | Frontend → Vercel · Backend → Render · DB → Render PostgreSQL |

---

## Features

- **JWT Authentication** with role-based access control (RBAC)
- **Admin Dashboard** — stats, activity feed, quick actions
- **Student Management** — CRUD with profile linking
- **Teacher Management** — CRUD with subject/department info
- **Class Management** — card-based UI, student enrollment
- **Attendance System** — mark attendance with Present/Late/Absent toggles, summary reports, CSV export
- **Grades System** — submit grades, auto-calculate letter grades (A+ scale), per-student reports
- **Glassmorphism UI** — dark theme, animated mesh backgrounds, responsive

---

## Roles

| Role    | Access |
|---------|--------|
| Admin   | Full CRUD on everything |
| Teacher | View/manage own classes, mark attendance, enter grades |
| Student | View own classes, grades, and attendance only |

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
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp ../.env.example .env        # fill in your values
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or create manually
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/school_db
SECRET_KEY=your-secret-key-min-32-chars
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
ENVIRONMENT=development
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=https://school-managment-system-h7mn.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=EduCore
```

---

## Deployment

### Backend → Render
1. Connect GitHub repo to Render
2. Root directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard

### Frontend → Vercel
1. Import GitHub repo on vercel.com
2. Framework: Next.js (auto-detected)
3. Root directory: `frontend`
4. Add env var: `NEXT_PUBLIC_API_URL`
5. Deploy

After deploy, update `ALLOWED_ORIGINS` in Render to include your Vercel URL.

---

## Project Structure

```
school-management-system/
├── backend/                  FastAPI backend
│   ├── app/
│   │   ├── api/routes/       auth, students, teachers, classes, attendance, grades
│   │   ├── core/             config, database, security
│   │   ├── models/           SQLAlchemy ORM models
│   │   ├── schemas/          Pydantic schemas
│   │   └── utils/            grading utility
│   ├── main.py
│   └── requirements.txt
└── frontend/                 Next.js frontend
    ├── app/                  App Router pages
    ├── components/           Sidebar, TopBar, Modal, Toast, DataTable
    └── lib/                  api.ts, auth.ts, constants.ts
```
