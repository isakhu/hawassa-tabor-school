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

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = ROUTES.LOGIN;
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail ?? data);
    throw new Error(message);
  }

  return data as T;
}

/** Download an authenticated binary file from the FastAPI backend. */
export async function downloadFile(endpoint: string, fallbackFilename: string): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = ROUTES.LOGIN;
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let message = "Unable to download the final result.";
    try {
      const data = await response.json();
      message = typeof data?.detail === "string" ? data.detail : message;
    } catch {
      // Keep the fallback message for non-JSON errors.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export function get<T = unknown>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET" });
}

export function post<T = unknown>(endpoint: string, body: unknown): Promise<T> {
  return apiFetch<T>(endpoint, { method: "POST", body });
}

export function put<T = unknown>(endpoint: string, body: unknown): Promise<T> {
  return apiFetch<T>(endpoint, { method: "PUT", body });
}

export function del<T = unknown>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE" });
}
