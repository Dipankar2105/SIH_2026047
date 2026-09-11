"use client";

import { createContext, useContext } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/lib/services/temporary-auth.adapter";

interface AuthContextValue {
  login: (credentials: {
    hprId: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser, clearAuth, setLoading, setError } =
    useAuthStore();

  const login = async (credentials: {
    hprId: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.login(credentials);
      if (!user) {
        throw new Error("Login failed");
      }
      setUser(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isAuthenticated,
        isLoading: useAuthStore.getState().isLoading,
        error: useAuthStore.getState().error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
