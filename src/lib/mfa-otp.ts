import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { getMfaSecret } from "@/lib/daily-mfa";

export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(OTP_LENGTH, "0");
}

export function hashOtpCode(userId: string, code: string): string {
  return createHmac("sha256", getMfaSecret())
    .update(`${userId}:${code}`)
    .digest("hex");
}

export function verifyOtpCode(userId: string, code: string, storedHash: string): boolean {
  const expected = hashOtpCode(userId, code.trim());
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(storedHash);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}
