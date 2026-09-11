/**
 * AarogyaFlow Patient Web — API Client
 * 
 * Base URL: NEXT_PUBLIC_API_BASE_URL (inlined at build time by Next.js).
 * NOTE: NEXT_PUBLIC_* vars are inlined at BUILD time — changing them requires
 * a full rebuild. They are NOT available at runtime via process.env after build.
 *
 * Mock/real toggle: NEXT_PUBLIC_USE_MOCK_API
 *   - unset / "true"  → mock mode (safe default)
 *   - "false"         → real backend
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export const IS_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

const DEFAULT_TIMEOUT_MS = 12000;

export interface ApiOptions extends RequestInit {
  timeoutMs?: number;
  authToken?: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem("patient_token"); } catch { return null; }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers, authToken, ...customConfig } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = authToken || getStoredToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const config: RequestInit = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(headers as Record<string, string>),
    },
    signal: controller.signal,
    ...customConfig,
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (response.status === 401) {
      // 401 → clear session and redirect to login
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("patient_token");
          localStorage.removeItem("patient_id");
          localStorage.removeItem("patient_name");
          localStorage.removeItem("patient_abha");
        } catch { /* ignore */ }
        window.location.href = "/";
      }
      throw new ApiError("Session expired. Please log in again.", 401);
    }

    if (!response.ok) {
      let errorData: unknown;
      try { errorData = await response.json(); } catch { errorData = await response.text(); }
      throw new ApiError(
        `HTTP Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    if (response.status === 204) return {} as T;
    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(`Request timeout after ${timeoutMs}ms`, 408);
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}

async function uploadFile<T>(endpoint: string, formData: FormData, options: ApiOptions = {}): Promise<T> {
  const { timeoutMs = 30000, authToken } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = authToken || getStoredToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: authHeaders,
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        try { localStorage.removeItem("patient_token"); } catch { /* ignore */ }
        window.location.href = "/";
      }
      throw new ApiError("Session expired.", 401);
    }

    if (!response.ok) {
      let errorData: unknown;
      try { errorData = await response.json(); } catch { errorData = await response.text(); }
      throw new ApiError(`HTTP Error ${response.status}: ${response.statusText}`, response.status, errorData);
    }
    if (response.status === 204) return {} as T;
    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new ApiError(`Upload timeout`, 408);
    throw new ApiError(error instanceof Error ? error.message : "Network error", 0);
  }
}

export const patientApiClient = {
  get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },
  post<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
  upload<T>(endpoint: string, formData: FormData, options?: ApiOptions): Promise<T> {
    return uploadFile<T>(endpoint, formData, options);
  },
};
