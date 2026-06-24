import type { Booking, Driver, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmedEmail } from "@/lib/send-booking-email";
import { isSquareConfigured } from "@/lib/square/config";
import {
  driverHasSquareConnected,
  getDriverAccessToken,
} from "@/lib/square/driver-tokens";
import { createSquarePaymentLink } from "@/lib/square/payment-links";

type BookingWithDriver = Booking & { driver: Driver | null };

export type PaymentLinkSkipReason =
  | "not_confirmed"
  | "already_paid"
  | "already_has_link"
  | "square_not_configured"
  | "driver_not_connected"
  | "no_fare"
  | "token_error"
  | "square_api_error";

export type EnsurePaymentLinkResult = {
  created: boolean;
  paymentLinkUrl: string | null;
  paymentStatus: PaymentStatus;
  skipReason?: PaymentLinkSkipReason;
  error?: string;
};

export function canSetEnRoute(paymentStatus: PaymentStatus): boolean {
  return paymentStatus !== "AWAITING_PAYMENT";
}

export async function ensureBookingPaymentLink(
  bookingId: string
): Promise<EnsurePaymentLinkResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { driver: true },
  });

  if (!booking) {
    return {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: "NOT_REQUIRED",
      skipReason: "not_confirmed",
    };
  }

  if (booking.status !== "CONFIRMED") {
    return {
      created: false,
      paymentLinkUrl: booking.squarePaymentLinkUrl,
      paymentStatus: booking.paymentStatus,
      skipReason: "not_confirmed",
    };
  }

  if (booking.paymentStatus === "PAID") {
    return {
      created: false,
      paymentLinkUrl: booking.squarePaymentLinkUrl,
      paymentStatus: booking.paymentStatus,
      skipReason: "already_paid",
    };
  }

  if (booking.squarePaymentLinkUrl) {
    return {
      created: false,
      paymentLinkUrl: booking.squarePaymentLinkUrl,
      paymentStatus: booking.paymentStatus,
      skipReason: "already_has_link",
    };
  }

  if (!isSquareConfigured()) {
    return {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "square_not_configured",
      error: "Square is not configured on this site.",
    };
  }

  if (!booking.driver || !driverHasSquareConnected(booking.driver)) {
    return {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "driver_not_connected",
      error: "The assigned driver has not connected Square yet.",
    };
  }

  if (!booking.estimatedPrice || booking.estimatedPrice <= 0) {
    return {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "no_fare",
      error: "This booking has no fare to collect.",
    };
  }

  const tokenResult = await getDriverAccessToken(booking.driver.id);
  if (!tokenResult.ok) {
    console.error("Square access token unavailable:", tokenResult.error);
    return {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "token_error",
      error: tokenResult.error,
    };
  }

  const amountPence = Math.round(booking.estimatedPrice * 100);
  const linkResult = await createSquarePaymentLink({
    accessToken: tokenResult.accessToken,
    locationId: tokenResult.locationId,
    reference: booking.reference,
    amountPence,
    description: `Sparkride ${booking.reference}`,
  });

  if (!linkResult.ok) {
    console.error("Square payment link creation failed:", linkResult.error);
    return {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "square_api_error",
      error: linkResult.error,
    };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "AWAITING_PAYMENT",
      amountDue: booking.estimatedPrice,
      squarePaymentLinkId: linkResult.id,
      squarePaymentLinkUrl: linkResult.url,
    },
  });

  return {
    created: true,
    paymentLinkUrl: linkResult.url,
    paymentStatus: "AWAITING_PAYMENT",
  };
}

/** Create payment links for confirmed bookings when a driver connects Square. */
export async function backfillDriverPaymentLinks(driverId: string): Promise<number> {
  const bookings = await prisma.booking.findMany({
    where: {
      driverId,
      status: "CONFIRMED",
      paymentStatus: { not: "PAID" },
      squarePaymentLinkUrl: null,
    },
    select: { id: true },
  });

  let created = 0;
  for (const booking of bookings) {
    const result = await ensureBookingPaymentLink(booking.id);
    if (result.created) created += 1;
  }
  return created;
}

export async function handleBookingConfirmed(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { driver: true },
  });

  if (!booking?.customerEmail) return;

  const paymentResult = await ensureBookingPaymentLink(bookingId);

  const fresh = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { driver: true },
  });

  const paymentLinkUrl = fresh?.squarePaymentLinkUrl ?? paymentResult.paymentLinkUrl;
  const paymentStatus = fresh?.paymentStatus ?? paymentResult.paymentStatus;
  const amountDue = fresh?.amountDue ?? fresh?.estimatedPrice ?? booking.estimatedPrice;

  if (paymentResult.error && !paymentResult.created) {
    console.error(
      `Payment link not created for ${booking.reference}:`,
      paymentResult.skipReason,
      paymentResult.error
    );
  }

  const emailResult = await sendBookingConfirmedEmail(booking.customerEmail, {
    reference: booking.reference,
    customerName: booking.customerName,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDate: booking.pickupDate,
    driverName: booking.driver?.name ?? fresh?.driver?.name ?? "Your driver",
    vehicleLabel: booking.driver?.vehicleLabel ?? fresh?.driver?.vehicleLabel,
    estimatedPrice: amountDue ?? booking.estimatedPrice,
    paymentLinkUrl,
    paymentStatus,
  });

  if (!emailResult.ok) {
    console.error("Booking confirmation email failed:", emailResult.error);
  }
}

export async function markBookingPaidByReference(
  reference: string,
  squarePaymentId: string
): Promise<boolean> {
  const result = await prisma.booking.updateMany({
    where: {
      reference,
      paymentStatus: "AWAITING_PAYMENT",
    },
    data: {
      paymentStatus: "PAID",
      squarePaymentId,
      paidAt: new Date(),
    },
  });

  return result.count > 0;
}

export function paymentLinkSkipMessage(result: EnsurePaymentLinkResult): string | null {
  if (result.created || result.paymentLinkUrl) return null;

  switch (result.skipReason) {
    case "driver_not_connected":
      return "Your driver has not finished connecting Square for online payments.";
    case "square_not_configured":
      return "Online payments are not configured on Sparkride yet.";
    case "no_fare":
      return "No fare is set for this booking, so a payment link cannot be created.";
    case "token_error":
      return "We could not access your driver's Square account. They may need to reconnect Square.";
    case "square_api_error":
      return result.error ?? "Square could not create a payment link. Please try again shortly.";
    default:
      return result.error ?? null;
  }
}
