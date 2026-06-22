import type { User } from "@supabase/supabase-js";

export const MFA_COOKIE_NAME = "sparkride_daily_mfa";
export const MFA_TIMEZONE = "Europe/London";

/** Calendar date in Europe/London as YYYY-MM-DD */
export function getLondonDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MFA_TIMEZONE }).format(date);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Edge-safe MFA cookie verification (Web Crypto API) */
export async function verifyMfaCookie(
  value: string | undefined,
  secret: string | undefined
): Promise<{ userId: string; date: string } | null> {
  if (!value || !secret) return null;

  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [userId, date, sig] = parts;
  if (!userId || !date || !sig) return null;
  if (date !== getLondonDateString()) return null;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${userId}.${date}`));
  const expected = base64UrlEncode(signature);
  if (sig !== expected) return null;

  return { userId, date };
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

/** True when the user signed in during the current London calendar day */
export function signedInTodayLondon(user: User): boolean {
  const lastSignIn = user.last_sign_in_at;
  if (!lastSignIn) return true;
  return new Date(lastSignIn) >= startOfLondonDay();
}
