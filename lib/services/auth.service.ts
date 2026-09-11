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
