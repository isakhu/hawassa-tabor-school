import { API_BASE_URL, ROUTES, STORAGE_KEYS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  body?: any;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

/**
 * apiFetch — typed fetch wrapper for the FastAPI backend.
 *
 * - Prepends API_BASE_URL to every request
 * - Reads JWT from localStorage and injects Authorization: Bearer header
 * - On 401: clears localStorage and redirects to /login
 * - Returns parsed JSON of type T
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // Retrieve token (only available in browser)
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // Handle unauthenticated responses globally
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = ROUTES.LOGIN;
    }
    throw new Error("Session expired. Please log in again.");
  }

  // For 204 No Content (DELETE responses) return empty object
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    // FastAPI returns { detail: string } on errors
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail ?? data);
    throw new Error(message);
  }

  return data as T;
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

/** GET /endpoint */
export function get<T = unknown>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET" });
}

/** POST /endpoint with JSON body */
export function post<T = unknown>(endpoint: string, body: unknown): Promise<T> {
  return apiFetch<T>(endpoint, { method: "POST", body });
}

/** PUT /endpoint with JSON body */
export function put<T = unknown>(endpoint: string, body: unknown): Promise<T> {
  return apiFetch<T>(endpoint, { method: "PUT", body });
}

/** DELETE /endpoint */
export function del<T = unknown>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE" });
}
