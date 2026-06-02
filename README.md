# 🎓 School Management System API

A production-style backend system built with **FastAPI + PostgreSQL + JWT authentication**.  
This project simulates a real-world school management platform with role-based access control.

---

## 🚀 Features

### 🔐 Authentication
- JWT-based login system
- Secure password hashing (bcrypt)
- Role-based access control (Admin, Teacher, Student)

### 👨‍🎓 Student Management
- Full CRUD operations
- Role-based permissions
- Student profile linking with user accounts

### 👨‍🏫 Teacher Management
- CRUD operations
- Subject & department assignment
- Role-restricted access

### 🏫 Class Management
- Class creation and enrollment support
- Teacher-class assignment structure

### 📅 Attendance System
- Mark attendance (Present / Absent / Late)
- Duplicate prevention per student per day
- Role-based access control

### 📊 Grading System
- Custom grading scale (A+ to F)
- Automatic grade calculation
- GPA-ready structure

---

## 🧠 Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- JWT (Auth)
- Passlib (Security)

---

## 🏗️ Architecture

- REST API design
- Modular folder structure
- Service-oriented backend design
- Role-based access control (RBAC)

---

## ⚙️ Setup Instructions

```bash
# 1. Clone repo
git clone <your-repo-url>

# 2. Go to backend
cd backend

# 3. Create virtual environment
python -m venv venv

# 4. Activate venv
venv\Scripts\activate

# 5. Install dependencies
pip install -r requirements.txt

# 6. Run server
uvicorn main:app --reload
