import { ROLES, ROUTES, STORAGE_KEYS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: ROLES;
  is_active: boolean;
  created_at: string;
}

// ─── Token ───────────────────────────────────────────────────────────────────

/**
 * Persist JWT to both localStorage and a cookie.
 * Middleware runs on the edge and cannot access localStorage —
 * the cookie is what middleware reads for route protection.
 */
export function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  // SameSite=Lax keeps it safe; omit HttpOnly so JS can read it too
  document.cookie = `${STORAGE_KEYS.TOKEN}=${token}; path=/; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function saveUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getUserRole(): ROLES | null {
  return getUser()?.role ?? null;
}

// ─── State helpers ────────────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  // Expire the cookie by setting max-age=0
  document.cookie = `${STORAGE_KEYS.TOKEN}=; path=/; max-age=0`;
  window.location.href = ROUTES.LOGIN;
}

// ─── Role → dashboard route ───────────────────────────────────────────────────

export function dashboardForRole(role: string): string {
  switch (role.toUpperCase()) {
    case ROLES.ADMIN:   return ROUTES.DASHBOARD_ADMIN;
    case ROLES.TEACHER: return ROUTES.DASHBOARD_TEACHER;
    case ROLES.STUDENT: return ROUTES.DASHBOARD_STUDENT;
    default:            return ROUTES.LOGIN;
  }
}
