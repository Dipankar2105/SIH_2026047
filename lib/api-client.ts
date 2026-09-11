/**
 * AarogyaFlow Doctor Console — API Client
 *
 * Base URL: NEXT_PUBLIC_API_BASE_URL (inlined at Next.js build time).
 * NOTE: NEXT_PUBLIC_* vars are inlined at BUILD TIME — changing them requires
 * a full rebuild. They are NOT available at runtime after build.
 *
 * Token: Attached via setApiToken() called from auth-provider after login.
 * On 401: clears the stored token and redirects to /login.
 *
 * Mock toggle: NEXT_PUBLIC_USE_MOCK_API
 *   - unset / "true"  → mock mode
 *   - "false"         → real backend
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const DEFAULT_TIMEOUT_MS = 10000;

// ── Token storage (module-level, set by auth layer after login) ────────────
let _currentToken: string | null = null;

export function setApiToken(token: string | null): void {
  _currentToken = token;
}

export function getApiToken(): string | null {
  return _currentToken;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ApiOptions extends RequestInit {
  timeoutMs?: number;
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

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...customConfig } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const authHeaders: Record<string, string> = _currentToken
    ? { Authorization: `Bearer ${_currentToken}` }
    : {};

  const config: RequestInit = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
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

    // 401 → clear session and redirect to login
    if (response.status === 401) {
      _currentToken = null;
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError("Session expired. Please log in again.", 401);
    }

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(
        `HTTP Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Return empty object if 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(`Request timeout after ${timeoutMs}ms`, 408);
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}

export const apiClient = {
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

  delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
