import type { BookingInput } from "./types";
import { supabase } from "./supabase";

export type MfaStatus = {
  verified: boolean;
  expiresAt: string | null;
};

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function authFetch(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  const base = (await import("./api")).getApiBaseUrl();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${base}${path}`, { ...init, headers });
}

export async function fetchMfaStatus(): Promise<MfaStatus> {
  const res = await authFetch("/api/auth/mfa/status");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to check verification status");
  return data;
}

export async function completeDailyMfa(): Promise<void> {
  const res = await authFetch("/api/auth/mfa/complete", { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to complete verification");
}

export async function sendMfaEmailCode(): Promise<{
  resendIn: number;
  skipped?: boolean;
  sent?: boolean;
}> {
  const res = await authFetch("/api/auth/mfa/send", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (data.skipped) {
    return { resendIn: data.resendIn ?? 60, skipped: true };
  }
  if (!res.ok) {
    throw new Error(data.error || "Failed to send verification code");
  }
  if (!data.sent) {
    throw new Error("Verification code could not be sent");
  }
  return { resendIn: data.resendIn ?? 60, sent: true };
}

export async function verifyMfaEmailCode(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw error;
  await completeDailyMfa();
}

export async function signOutWithMfaClear() {
  await authFetch("/api/auth/sign-out", { method: "POST" });
  await supabase.auth.signOut();
}

/** Returns true when the user may access booking features */
export async function hasDailyMfaAccess(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return false;

  const status = await fetchMfaStatus();
  return status.verified;
}

export async function syncCustomerProfile() {
  const token = await getAccessToken();
  if (!token) return;

  const base = (await import("./api")).getApiBaseUrl();
  await fetch(`${base}/api/customer/profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

export async function signUpWithEmail({ email, password, name, phone }: SignUpInput) {
  const base = (await import("./api")).getApiBaseUrl();
  const emailRedirectTo = `${base}/auth/callback?redirect=${encodeURIComponent("/")}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone },
      emailRedirectTo,
    },
  });
  if (error) throw error;

  if (data.session) {
    await syncCustomerProfile();
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await syncCustomerProfile();
  return data;
}

export async function signOut() {
  await signOutWithMfaClear();
}

export type CustomerProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

export async function fetchCustomerProfile(): Promise<CustomerProfile> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");

  const base = (await import("./api")).getApiBaseUrl();
  const res = await fetch(`${base}/api/customer/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load profile");
  return data;
}

export async function createAuthenticatedBooking(payload: BookingInput) {
  const token = await getAccessToken();
  if (!token) throw new Error("Sign in required to book");

  const base = (await import("./api")).getApiBaseUrl();
  const res = await fetch(`${base}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Booking failed");
  return data as { reference: string; estimatedPrice: number };
}

export async function fetchMyBookings() {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");

  const base = (await import("./api")).getApiBaseUrl();
  const res = await fetch(`${base}/api/customer/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load bookings");
  return data;
}
