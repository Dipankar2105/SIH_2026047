import type { AuthService, LoginCredentials, User } from "./auth.service";

const TEMPORARY_USERS: Record<string, { password: string; user: User }> = {
  "DR-1234-5678-9012": {
    password: "password123",
    user: {
      id: "user-1",
      name: "Dr. A. Sharma",
      email: "dr.sharma@hospital.com",
      role: "Doctor",
      facility: "City Government Hospital",
      opdRoom: "OPD 14",
      initials: "DS",
    },
  },
};

class TemporaryAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const normalizedHprId = credentials.hprId.toUpperCase().trim();
    const record = TEMPORARY_USERS[normalizedHprId];

    if (!record || record.password !== credentials.password) {
      throw new Error("Invalid HPR ID or password");
    }

    return record.user;
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  async validateSession(): Promise<boolean> {
    return false;
  }
}

export const authService: AuthService = new TemporaryAuthService();
