# EduCore Database Deployment Setup

**Project:** EduCore — School Management System  
**Intern:** Yishak Tule  
**Organization:** Sidam Science and Technology Agency  
**Location:** Hawassa, Ethiopia

## Database

EduCore uses **PostgreSQL** as its relational database. The FastAPI backend accesses PostgreSQL asynchronously through SQLAlchemy and the `asyncpg` driver.

## Production connection

The production database URL must be supplied through the deployment platform's environment variables. Do not commit credentials to GitHub.

Example format:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/DATABASE
```

The exact production host, username, password, and database name must be configured in the deployment environment rather than stored in source control.

## Deployment sequence

1. Provision a PostgreSQL database.
2. Configure the backend `DATABASE_URL` secret.
3. Apply the project's database schema/migrations.
4. Start the FastAPI application.
5. Verify the health endpoint and database-dependent API operations.
6. Configure the frontend API base URL to point to the deployed backend.

## Data ownership

The database stores users, students, teachers, classes, enrollments, attendance, grades, and related academic records. Normal school operations should be performed through the application UI/API rather than direct database editing.

## Production safety

- Never commit `.env` files containing credentials.
- Use a separate production database from development data.
- Back up production data according to the organization's operational policy.
- Keep demo-data seeding disabled in production unless explicitly required for a controlled environment.
