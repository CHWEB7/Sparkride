export const BOOKING_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type BookingStatusValue = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatusValue, string> = {
  PENDING: "New booking",
  ACCEPTED: "Accepted",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_COLORS_DARK: Record<BookingStatusValue, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  ACCEPTED: "bg-blue-500/20 text-blue-400",
  CONFIRMED: "bg-purple-500/20 text-purple-400",
  COMPLETED: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
};

export const BOOKING_STATUS_COLORS_LIGHT: Record<BookingStatusValue, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

/** @deprecated Legacy DB value — mapped for display only */
const LEGACY_STATUS_LABELS: Record<string, string> = {
  PAID: "Confirmed",
  EN_ROUTE: "Confirmed",
};

export function formatBookingStatus(status: string): string {
  if (status in LEGACY_STATUS_LABELS) {
    return LEGACY_STATUS_LABELS[status];
  }
  return BOOKING_STATUS_LABELS[status as BookingStatusValue] ?? status.replace(/_/g, " ");
}

/** Bookings shown on the driver calendar (paid or pay-with-driver accepted trips). */
export function isCalendarBookingStatus(status: string): boolean {
  return status === "CONFIRMED" || status === "COMPLETED" || status === "PAID";
}

export function isCalendarEligibleBooking(status: string, paymentStatus: string): boolean {
  if (status === "COMPLETED" || status === "CONFIRMED") return true;
  if (status === "ACCEPTED" && paymentStatus === "NOT_REQUIRED") return true;
  return isCalendarBookingStatus(status);
}
