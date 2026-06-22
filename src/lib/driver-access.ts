import type { DriverSession } from "@/lib/auth";

export const TEST_DRIVER_EMAIL = "test@sparkride.co.uk";

export function isTestDriver(email: string): boolean {
  return email.toLowerCase() === TEST_DRIVER_EMAIL;
}

/** Test driver sees all bookings; others only see jobs assigned to them. */
export function driverBookingsFilter(session: DriverSession) {
  if (isTestDriver(session.email)) {
    return {};
  }
  return { driverId: session.driverId };
}

export function canDriverManageBooking(
  session: DriverSession,
  bookingDriverId: string | null
): boolean {
  if (isTestDriver(session.email)) return true;
  return bookingDriverId === session.driverId;
}
