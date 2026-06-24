import type { PaymentStatus } from "@prisma/client";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NOT_REQUIRED: "Payment with driver",
  AWAITING_PAYMENT: "Pay now",
  PAID: "Paid",
  FAILED: "Payment failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  NOT_REQUIRED: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  PAID: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
  REFUNDED: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
};

type PayableBooking = {
  status: string;
  paymentStatus: PaymentStatus;
  squarePaymentLinkUrl?: string | null;
};

export function canPayOnline(booking: PayableBooking): boolean {
  return (
    booking.status === "ACCEPTED" &&
    booking.paymentStatus === "AWAITING_PAYMENT" &&
    Boolean(booking.squarePaymentLinkUrl)
  );
}

export function showPaymentStatus(booking: PayableBooking): boolean {
  return (
    booking.status === "ACCEPTED" ||
    booking.status === "CONFIRMED" ||
    booking.paymentStatus === "PAID"
  );
}
