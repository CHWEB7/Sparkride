import type { AppMeta, Booking, BookingInput } from "./types";
import Constants from "expo-constants";

const REQUEST_TIMEOUT_MS = 8000;

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }

  return "http://localhost:3000";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out — check the API is running");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export function fetchMeta() {
  return request<AppMeta>("/api/mobile/meta");
}

export function fetchBookings() {
  return request<Booking[]>("/api/mobile/bookings");
}

export function updateBookingStatus(id: string, status: string) {
  return request<Booking>("/api/mobile/bookings", {
    method: "PATCH",
    body: JSON.stringify({ id, status }),
  });
}

export function createBooking(payload: BookingInput) {
  return request<{ reference: string; estimatedPrice: number }>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchBookingByRef(ref: string) {
  return request<Booking>(`/api/bookings?ref=${encodeURIComponent(ref)}`);
}
