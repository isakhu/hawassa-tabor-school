// ─── API ─────────────────────────────────────────────────────────────────────

// Local development uses FastAPI on port 8000. Production is wired directly
// to the already-deployed Render backend so a fresh Vercel import needs no
// manually entered frontend environment variable.
const LOCAL_API_URL = "http://127.0.0.1:8000/api/v1";
const PRODUCTION_API_URL = "https://hawassa-tabor-school.onrender.com/api/v1";

export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL as string)?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "production" ? PRODUCTION_API_URL : LOCAL_API_URL);

// ─── Routes ──────────────────────────────────────────────────────────────────

export const ROUTES = {
  LOGIN:              "/login",
  REGISTER:           "/register",
  DASHBOARD_ADMIN:    "/dashboard/admin",
  DASHBOARD_TEACHER:  "/dashboard/teacher",
  DASHBOARD_STUDENT:  "/dashboard/student",
  STUDENTS:           "/students",
  TEACHERS:           "/teachers",
  CLASSES:            "/classes",
  ATTENDANCE:         "/attendance",
  GRADES:             "/grades",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// ─── Roles ───────────────────────────────────────────────────────────────────

export enum ROLES {
  ADMIN   = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

// ─── Local storage keys ───────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER:  "user",
} as const;
