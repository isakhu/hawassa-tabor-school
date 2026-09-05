import { API_BASE_URL, ROUTES, STORAGE_KEYS } from "@/lib/constants";

interface FetchOptions extends RequestInit {
  body?: any;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 20_000;

function createTimeoutSignal(timeoutMs: number, existing?: AbortSignal | null): AbortSignal {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  if (existing) {
    if (existing.aborted) controller.abort();
    else existing.addEventListener("abort", () => controller.abort(), { once: true });
  }

  controller.signal.addEventListener("abort", () => window.clearTimeout(timeout), { once: true });
  return controller.signal;
}

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

  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestOptions } = options;
  const signal =
    typeof window !== "undefined"
      ? createTimeoutSignal(timeoutMs, options.signal)
      : options.signal;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The school server took too long to respond. Please try again.");
    }
    throw new Error("Unable to connect to the school server. Please check your connection and try again.");
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      document.cookie = `${STORAGE_KEYS.TOKEN}=; path=/; max-age=0; SameSite=Lax`;
      window.location.href = ROUTES.LOGIN;
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : typeof data === "string" && data
          ? data
          : JSON.stringify(data?.detail ?? data);
    throw new Error(message || `Request failed with status ${response.status}.`);
  }

  return data as T;
}

export async function downloadFile(endpoint: string, fallbackFilename: string): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.TOKEN)
      : null;

  let response: Response;
  try {
    const signal =
      typeof window !== "undefined" ? createTimeoutSignal(30_000) : undefined;
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The download took too long to start. Please try again.");
    }
    throw new Error("Unable to connect to the school server.");
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      document.cookie = `${STORAGE_KEYS.TOKEN}=; path=/; max-age=0; SameSite=Lax`;
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
