/**
 * useAuth — Patient Web
 * React hook for patient authentication.
 */
import { useState, useEffect, useCallback } from "react";
import { authStore } from "../store/auth-store";
import { identityService } from "../services/api/identity";
import type { PatientLoginRequest } from "../services/api/identity";

export function useAuth() {
  const [state, setState] = useState(authStore.getState());

  useEffect(() => {
    return authStore.subscribe(() => setState(authStore.getState()));
  }, []);

  const login = useCallback(async (credentials: PatientLoginRequest) => {
    authStore.setLoading(true);
    authStore.setError(null);
    try {
      const session = await identityService.login(credentials);
      authStore.setSession(session);
      return session;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      authStore.setError(msg);
      throw err;
    } finally {
      authStore.setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    authStore.setLoading(true);
    try {
      await identityService.logout();
    } finally {
      authStore.clearAuth();
      authStore.setLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    authStore.setLoading(true);
    try {
      const profile = await identityService.getProfile();
      authStore.setProfile(profile);
      return profile;
    } catch (err) {
      console.warn("Failed to load profile:", err);
    } finally {
      authStore.setLoading(false);
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    loadProfile,
  };
}
