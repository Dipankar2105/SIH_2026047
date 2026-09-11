/**
 * Validation helpers — Patient Web
 */

export function isValidAbha(abha: string): boolean {
  // ABHA number format: XX-XXXX-XXXX-XXXX (14 digits with dashes) or 14 plain digits
  const clean = abha.replace(/-/g, "");
  return /^\d{14}$/.test(clean);
}

export function isValidPhone(phone: string): boolean {
  return /^(\+91)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));
}

export function isValidOtp(otp: string): boolean {
  return /^\d{4,6}$/.test(otp);
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

export function isValidDate(dob: string): boolean {
  const d = new Date(dob);
  return !isNaN(d.getTime()) && d < new Date();
}
