// ─── API ─────────────────────────────────────────────────────────────────────

// Local development uses FastAPI on port 8000. A deployment can provide
// NEXT_PUBLIC_API_URL explicitly; there is no stale hosting URL fallback.
export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL as string)?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api/v1";

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
