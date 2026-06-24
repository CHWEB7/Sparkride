import type { Booking, PaymentStatus } from "@prisma/client";
import type { BookingStatusValue } from "@/lib/booking-status";

export type DriverBookingAction =
  | "accept"
  | "send_payment_link"
  | "complete"
  | "cancel";

type BookingSnapshot = Pick<Booking, "status" | "paymentStatus">;

export function canDriverAction(
  booking: BookingSnapshot,
  action: DriverBookingAction
): boolean {
  switch (action) {
    case "accept":
      return booking.status === "PENDING";
    case "send_payment_link":
      return (
        booking.status === "ACCEPTED" &&
        booking.paymentStatus !== "PAID" &&
        booking.paymentStatus !== "NOT_REQUIRED"
      );
    case "complete":
      if (booking.status === "CONFIRMED") return true;
      return (
        booking.status === "ACCEPTED" && booking.paymentStatus === "NOT_REQUIRED"
      );
    case "cancel":
      return (
        booking.status === "PENDING" ||
        booking.status === "ACCEPTED" ||
        booking.status === "CONFIRMED"
      );
    default:
      return false;
  }
}

export function statusForDriverAction(
  action: DriverBookingAction
): BookingStatusValue | null {
  switch (action) {
    case "accept":
      return "ACCEPTED";
    case "complete":
      return "COMPLETED";
    case "cancel":
      return "CANCELLED";
    case "send_payment_link":
      return null;
    default:
      return null;
  }
}

export function driverActionLabel(action: DriverBookingAction): string {
  switch (action) {
    case "accept":
      return "Accept";
    case "send_payment_link":
      return "Send payment link";
    case "complete":
      return "Mark completed";
    case "cancel":
      return "Cancel";
  }
}

export function paymentAwaiting(booking: BookingSnapshot): boolean {
  return (
    booking.paymentStatus === "AWAITING_PAYMENT" ||
    (booking.status === "ACCEPTED" &&
      booking.paymentStatus !== "PAID" &&
      booking.paymentStatus !== "NOT_REQUIRED")
  );
}

export function isPaidBooking(booking: BookingSnapshot): boolean {
  return booking.paymentStatus === "PAID" || booking.status === "CONFIRMED";
}
