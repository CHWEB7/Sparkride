import type { BookingInput } from "./types";
import { supabase } from "./supabase";

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
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
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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
