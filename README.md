# EduCore — School Management System

<div align="center">

![EduCore Banner](https://img.shields.io/badge/EduCore-School%20Management%20System-6366f1?style=for-the-badge&logo=graduation-cap)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=flat-square&logo=vercel)](https://school-managment-system-flax.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=flat-square&logo=render)](https://school-managment-system-h7mn.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

A modern, full-stack school management platform built with Next.js 14 and FastAPI. Manage students, teachers, classes, attendance, and grades — all from one powerful platform.

[Live Demo](https://school-managment-system-flax.vercel.app) · [Backend API](https://school-managment-system-h7mn.onrender.com) · [Report Bug](https://github.com/isakhu/school-managment-system/issues) · [Request Feature](https://github.com/isakhu/school-managment-system/issues)

</div>

---

## 📸 Preview

> Glassmorphism dark UI with animated mesh backgrounds, responsive across all devices.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://school-managment-system-flax.vercel.app |
| ⚙️ Backend API | https://school-managment-system-h7mn.onrender.com |
| 📄 API Docs | https://school-managment-system-h7mn.onrender.com/docs *(dev only)* |

> **Note:** Backend is hosted on Render's free tier and may take 30–60 seconds to wake up after inactivity.

---

## ✨ Features

- 🔐 **JWT Authentication** with role-based access control (RBAC)
- 📊 **Admin Dashboard** — stats, activity feed, quick actions
- 🎓 **Student Management** — full CRUD with profile linking
- 👨‍🏫 **Teacher Management** — CRUD with subject/department info
- 🏫 **Class Management** — card-based UI, student enrollment
- ✅ **Attendance System** — Present/Late/Absent toggles, summary reports, CSV export
- 📝 **Grades System** — submit grades, auto-calculate letter grades (A+ scale), per-student reports
- 🎨 **Glassmorphism UI** — dark theme, animated mesh backgrounds, fully responsive

---

## 👥 Roles & Permissions

| Role    | Access |
|---------|--------|
| 🛡️ Admin   | Full CRUD on everything |
| 👨‍🏫 Teacher | View/manage own classes, mark attendance, enter grades |
| 🎓 Student | View own classes, grades, and attendance only |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy (async), PostgreSQL |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Hosting | Frontend → Vercel · Backend → Render · DB → Render PostgreSQL |

---

## 📁 Project Structure
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

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### 1. Clone the repo

```bash
git clone https://github.com/isakhu/school-managment-system.git
cd school-managment-system
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
cp ../.env.example .env        # fill in your values
uvicorn main:app --reload
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or create manually
npm run dev
```

Open http://localhost:3000

### 4. Docker (optional)

```bash
docker-compose up --build
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/school_db
SECRET_KEY=your-secret-key-min-32-chars
ALLOWED_ORIGINS=http://localhost:3000,https://school-managment-system-flax.vercel.app
ENVIRONMENT=development
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://school-managment-system-h7mn.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=EduCore
```

---

## 🚢 Deployment

### Backend → Render
1. Connect GitHub repo to Render
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables in Render dashboard
6. Set `ALLOWED_ORIGINS` to include your Vercel URL

### Frontend → Vercel
1. Import GitHub repo on vercel.com
2. Framework: Next.js (auto-detected)
3. Root directory: `frontend`
4. Add env vars: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_NAME`
5. Deploy

---

## 👨‍💻 Developer

<div align="center">

<img src="https://github.com/isakhu.png" width="100" style="border-radius: 50%" alt="Yishak Tule"/>

### Yishak Tule

Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-isakhu-181717?style=flat-square&logo=github)](https://github.com/isakhu)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-yishak--tule-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/yishak-tule)
[![Portfolio](https://img.shields.io/badge/Portfolio-yishak--tule.vercel.app-6366f1?style=flat-square&logo=vercel)](https://yishak-tule.vercel.app)
[![Email](https://img.shields.io/badge/Email-yishakhak@gmail.com-EA4335?style=flat-square&logo=gmail)](mailto:yishakhak@gmail.com)

</div>

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Yishak Tule](https://yishak-tule.vercel.app)

⭐ Star this repo if you found it helpful!

</div>
