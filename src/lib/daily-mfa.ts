import { createHmac, timingSafeEqual } from "crypto";
import type { User } from "@supabase/supabase-js";

export const MFA_COOKIE_NAME = "sparkride_daily_mfa";
export const MFA_TIMEZONE = "Europe/London";

export function getMfaSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required for daily MFA");
  return secret;
}

export function getMfaSecretOrNull(): string | null {
  return process.env.JWT_SECRET ?? null;
}

/** Calendar date in Europe/London as YYYY-MM-DD */
export function getLondonDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MFA_TIMEZONE }).format(date);
}

/** Seconds from now until midnight in Europe/London */
export function secondsUntilMidnightLondon(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MFA_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const second = Number(parts.find((p) => p.type === "second")?.value ?? 0);
  const elapsed = hour * 3600 + minute * 60 + second;
  return Math.max(1, 86400 - elapsed);
}

export function getMidnightLondonExpiry(date = new Date()): Date {
  return new Date(date.getTime() + secondsUntilMidnightLondon(date) * 1000);
}

export function signMfaCookie(userId: string, date: string, secret = getMfaSecret()): string {
  const payload = `${userId}.${date}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function parseMfaCookie(
  value: string | undefined,
  secret?: string | null
): { userId: string; date: string } | null {
  const resolvedSecret = secret !== undefined ? secret : getMfaSecretOrNull();
  if (!resolvedSecret) return null;
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [userId, date, sig] = parts;
  if (!userId || !date || !sig) return null;

  const expected = createHmac("sha256", resolvedSecret).update(`${userId}.${date}`).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  if (date !== getLondonDateString()) return null;
  return { userId, date };
}

/** True when the user signed in during the current London calendar day */
export function signedInTodayLondon(user: User): boolean {
  const lastSignIn = user.last_sign_in_at;
  if (!lastSignIn) return true;
  return new Date(lastSignIn) >= startOfLondonDay();
}

export function startOfLondonDay(date = new Date()): Date {
  const dateStr = getLondonDateString(date);
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MFA_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(probe);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const second = Number(parts.find((p) => p.type === "second")?.value ?? 0);
  const londonNoonUtc = probe.getTime();
  const londonMidnightUtc = londonNoonUtc - (hour * 3600 + minute * 60 + second) * 1000;
  return new Date(londonMidnightUtc);
}

export function mfaCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
