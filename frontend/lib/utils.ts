/**
 * Utility functions — Patient Web
 */

/** Format an ISO date string to a human-readable date */
export function formatDate(iso?: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...options,
    });
  } catch {
    return iso;
  }
}

/** Format an ISO date to time string */
export function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/** Format file size in bytes to human-readable */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Mask a phone number for display */
export function maskPhone(phone: string): string {
  return phone.replace(/(\+?\d{2})(\d+)(\d{4})/, "$1XXXXXX$3");
}

/** Mask ABHA number for display */
export function maskAbha(abha: string): string {
  return abha.replace(/(\d{2}-\d{4})-(\d{4})-(\d{4})/, "$1-XXXX-$3");
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
