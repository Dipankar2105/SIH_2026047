/**
 * Storage Client — Patient Web
 *
 * Thin wrapper over localStorage / sessionStorage.
 * Centralises all keys in one place to avoid typo bugs across services.
 */

const KEYS = {
  // Auth
  PATIENT_TOKEN: "patient_token",
  PATIENT_ID: "patient_id",
  PATIENT_NAME: "patient_name",
  PATIENT_ABHA: "patient_abha",

  // Current flow
  INTAKE_SESSION_ID: "intake_session_id",
  INTAKE_SESSION: "intake_session",
  QUEUE_TOKEN: "queue_token",
  CURRENT_APPOINTMENT_ID: "current_appointment_id",
  CURRENT_APPOINTMENT: "current_appointment",

  // Preferences
  LANGUAGE: "preferred_language",
} as const;

type StorageKey = (typeof KEYS)[keyof typeof KEYS];

function safeGet(storage: Storage, key: string): string | null {
  try { return storage.getItem(key); } catch { return null; }
}

function safeSet(storage: Storage, key: string, value: string): void {
  try { storage.setItem(key, value); } catch { /* quota exceeded or private mode */ }
}

function safeRemove(storage: Storage, key: string): void {
  try { storage.removeItem(key); } catch { /* ignore */ }
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

export const storageClient = {
  KEYS,

  // ── localStorage ──────────────────────────────────────────────────────────

  local: {
    get(key: StorageKey): string | null {
      if (!isClient()) return null;
      return safeGet(localStorage, key);
    },
    set(key: StorageKey, value: string): void {
      if (!isClient()) return;
      safeSet(localStorage, key, value);
    },
    remove(key: StorageKey): void {
      if (!isClient()) return;
      safeRemove(localStorage, key);
    },
    getJson<T>(key: StorageKey): T | null {
      const raw = this.get(key);
      if (!raw) return null;
      try { return JSON.parse(raw) as T; } catch { return null; }
    },
    setJson<T>(key: StorageKey, value: T): void {
      this.set(key, JSON.stringify(value));
    },
  },

  // ── sessionStorage ────────────────────────────────────────────────────────

  session: {
    get(key: StorageKey): string | null {
      if (!isClient()) return null;
      return safeGet(sessionStorage, key);
    },
    set(key: StorageKey, value: string): void {
      if (!isClient()) return;
      safeSet(sessionStorage, key, value);
    },
    remove(key: StorageKey): void {
      if (!isClient()) return;
      safeRemove(sessionStorage, key);
    },
    getJson<T>(key: StorageKey): T | null {
      const raw = this.get(key);
      if (!raw) return null;
      try { return JSON.parse(raw) as T; } catch { return null; }
    },
    setJson<T>(key: StorageKey, value: T): void {
      this.set(key, JSON.stringify(value));
    },
  },

  // ── Convenience helpers ───────────────────────────────────────────────────

  clearPatientSession(): void {
    if (!isClient()) return;
    [KEYS.PATIENT_TOKEN, KEYS.PATIENT_ID, KEYS.PATIENT_NAME, KEYS.PATIENT_ABHA].forEach(
      (k) => safeRemove(localStorage, k)
    );
    [KEYS.INTAKE_SESSION_ID, KEYS.INTAKE_SESSION, KEYS.QUEUE_TOKEN, KEYS.CURRENT_APPOINTMENT_ID, KEYS.CURRENT_APPOINTMENT].forEach(
      (k) => safeRemove(sessionStorage, k)
    );
  },
};
