import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind-merge and clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to standard Indian healthcare display format (DD MMM YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Masks ABHA number for privacy display (e.g. XX-XXXX-XXXX-1234)
 */
export function maskAbha(abha: string): string {
  if (!abha || abha.length < 4) return abha;
  const last4 = abha.slice(-4);
  return `••-••••-••••-${last4}`;
}
