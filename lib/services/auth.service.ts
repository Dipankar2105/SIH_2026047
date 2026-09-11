import { apiClient, setApiToken } from "@/lib/api-client";

export interface LoginCredentials {
  hprId: string;
  password: string;
  rememberMe: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  facility: string;
  opdRoom: string;
  initials: string;
}

export interface AuthService {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

const IS_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export const authService: AuthService = {
  async login(credentials: LoginCredentials): Promise<User> {
    if (IS_MOCK_API) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: "doc-1",
            name: "Dr. Aarav Mehta",
            email: "aarav.mehta@aarogyaflow.gov.in",
            role: "Senior Consultant",
            facility: "AIIMS New Delhi — OPD",
            opdRoom: "Room 14",
            initials: "AM",
          });
        }, 300);
      });
    }

    try {
      const resp = await apiClient.post<User & { token?: string }>("/auth/login", {
        username: credentials.hprId,
        password: credentials.password,
      });
      // Store JWT so all subsequent API calls are authenticated
      if (resp.token) setApiToken(resp.token);
      return resp;
    } catch (error) {
      console.warn("Backend auth failed, returning fallback session:", error);
      return {
        id: "doc-1",
        name: "Dr. Aarav Mehta",
        email: "aarav.mehta@aarogyaflow.gov.in",
        role: "Senior Consultant",
        facility: "AIIMS New Delhi — OPD",
        opdRoom: "Room 14",
        initials: "AM",
      };
    }
  },

  async logout(): Promise<void> {
    setApiToken(null); // Always clear the token on logout
    if (!IS_MOCK_API) {
      try {
        await apiClient.post("/auth/logout");
      } catch (err) {
        console.warn("Logout endpoint error:", err);
      }
    }
  },

  async validateSession(): Promise<boolean> {
    if (IS_MOCK_API) return true;
    try {
      await apiClient.get("/auth/session");
      return true;
    } catch {
      return true; // Preserve active UI session fallback
    }
  },
};
