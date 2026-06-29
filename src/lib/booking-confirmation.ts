import type { Booking, Driver, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendBookingAcceptedEmail, sendBookingPaidEmail, sendBookingCancelledEmail } from "@/lib/send-booking-email";
import { isSquareConfigured } from "@/lib/square/config";
import {
  driverHasSquareConnected,
  getDriverAccessToken,
} from "@/lib/square/driver-tokens";
import { createSquarePaymentLink } from "@/lib/square/payment-links";

type BookingWithDriver = Booking & { driver: Driver | null };

export type PaymentLinkSkipReason =
  | "not_accepted"
  | "already_paid"
  | "already_has_link"
  | "square_not_configured"
  | "driver_not_connected"
  | "no_fare"
  | "token_error"
  | "square_api_error";

async function persistPaymentOutcome(
  bookingId: string,
  result: EnsurePaymentLinkResult
): Promise<void> {
  if (result.created || result.skipReason === "already_paid" || result.skipReason === "already_has_link") {
    return;
  }

  let paymentStatus: PaymentStatus | null = null;

  if (result.skipReason === "no_fare") {
    paymentStatus = "NOT_REQUIRED";
  } else if (
    result.skipReason === "driver_not_connected" ||
    result.skipReason === "square_not_configured" ||
    result.skipReason === "token_error" ||
    result.skipReason === "square_api_error"
  ) {
    paymentStatus = "AWAITING_PAYMENT";
  }

  if (!paymentStatus) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus },
  });
}

async function failPaymentLink(
  bookingId: string,
  result: EnsurePaymentLinkResult
): Promise<EnsurePaymentLinkResult> {
  await persistPaymentOutcome(bookingId, result);
  const fresh = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { paymentStatus: true },
  });
  return {
    ...result,
    paymentStatus: fresh?.paymentStatus ?? result.paymentStatus,
  };
}

export type EnsurePaymentLinkResult = {
  created: boolean;
  paymentLinkUrl: string | null;
  paymentStatus: PaymentStatus;
  skipReason?: PaymentLinkSkipReason;
  error?: string;
};

export async function ensureBookingPaymentLink(
  bookingId: string,
  options?: { forceResend?: boolean }
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
      skipReason: "not_accepted",
    };
  }

  if (booking.status !== "ACCEPTED") {
    return {
      created: false,
      paymentLinkUrl: booking.squarePaymentLinkUrl,
      paymentStatus: booking.paymentStatus,
      skipReason: "not_accepted",
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

  if (booking.squarePaymentLinkUrl && !options?.forceResend) {
    return {
      created: false,
      paymentLinkUrl: booking.squarePaymentLinkUrl,
      paymentStatus: booking.paymentStatus,
      skipReason: "already_has_link",
    };
  }

  if (!isSquareConfigured()) {
    return failPaymentLink(booking.id, {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "square_not_configured",
      error: "Square is not configured on this site.",
    });
  }

  if (!booking.driver || !driverHasSquareConnected(booking.driver)) {
    return failPaymentLink(booking.id, {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "driver_not_connected",
      error: "The assigned driver has not connected Square yet.",
    });
  }

  if (!booking.estimatedPrice || booking.estimatedPrice <= 0) {
    return failPaymentLink(booking.id, {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "no_fare",
      error: "This booking has no fare to collect.",
    });
  }

  const tokenResult = await getDriverAccessToken(booking.driver.id);
  if (!tokenResult.ok) {
    console.error("Square access token unavailable:", tokenResult.error);
    return failPaymentLink(booking.id, {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "token_error",
      error: tokenResult.error,
    });
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
    return failPaymentLink(booking.id, {
      created: false,
      paymentLinkUrl: null,
      paymentStatus: booking.paymentStatus,
      skipReason: "square_api_error",
      error: linkResult.error,
    });
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

/** Create payment links for accepted bookings when a driver connects Square. */
export async function backfillDriverPaymentLinks(driverId: string): Promise<number> {
  const bookings = await prisma.booking.findMany({
    where: {
      driverId,
      status: "ACCEPTED",
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

export async function handleBookingAccepted(bookingId: string): Promise<void> {
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

  const emailResult = await sendBookingAcceptedEmail(booking.customerEmail, {
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
    console.error("Booking accepted email failed:", emailResult.error);
  }
}

/** Resend payment link email (creates link if missing). */
export async function sendBookingPaymentLinkEmail(bookingId: string): Promise<{
  ok: boolean;
  error?: string;
  paymentLinkUrl?: string | null;
}> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { driver: true },
  });

  if (!booking?.customerEmail) {
    return { ok: false, error: "Booking not found" };
  }

  if (booking.status !== "ACCEPTED") {
    return { ok: false, error: "Booking must be accepted before sending a payment link" };
  }

  const paymentResult = await ensureBookingPaymentLink(bookingId);

  const fresh = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { driver: true },
  });

  const paymentLinkUrl = fresh?.squarePaymentLinkUrl ?? paymentResult.paymentLinkUrl;

  if (!paymentLinkUrl) {
    if (paymentResult.skipReason === "no_fare") {
      return {
        ok: false,
        error: paymentLinkSkipMessage(paymentResult) ?? "This booking does not require online payment",
      };
    }

    return {
      ok: false,
      error: paymentLinkSkipMessage(paymentResult) ?? "Could not create payment link",
    };
  }

  const emailResult = await sendBookingAcceptedEmail(booking.customerEmail, {
    reference: booking.reference,
    customerName: booking.customerName,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDate: booking.pickupDate,
    driverName: booking.driver?.name ?? fresh?.driver?.name ?? "Your driver",
    vehicleLabel: booking.driver?.vehicleLabel ?? fresh?.driver?.vehicleLabel,
    estimatedPrice: fresh?.amountDue ?? fresh?.estimatedPrice ?? booking.estimatedPrice,
    paymentLinkUrl,
    paymentStatus: fresh?.paymentStatus ?? paymentResult.paymentStatus,
  });

  if (!emailResult.ok) {
    return { ok: false, error: emailResult.error };
  }

  return { ok: true, paymentLinkUrl };
}

/** @deprecated Use handleBookingAccepted */
export const handleBookingConfirmed = handleBookingAccepted;

/** @deprecated Use completeBookingPayment */
export async function markBookingPaidByReference(
  reference: string,
  squarePaymentId: string
): Promise<boolean> {
  return completeBookingPayment(reference, squarePaymentId);
}

export async function completeBookingPayment(
  reference: string,
  squarePaymentId: string
): Promise<boolean> {
  const existing = await prisma.booking.findUnique({
    where: { reference },
    include: { driver: true },
  });

  if (!existing) return false;

  if (existing.paymentStatus === "PAID") {
    return true;
  }

  const result = await prisma.booking.updateMany({
    where: {
      reference,
      paymentStatus: { not: "PAID" },
    },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      squarePaymentId,
      paidAt: new Date(),
    },
  });

  if (result.count === 0) {
    const fresh = await prisma.booking.findUnique({
      where: { reference },
      select: { paymentStatus: true },
    });
    return fresh?.paymentStatus === "PAID";
  }

  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { driver: true },
  });

  if (!booking?.customerEmail) return true;

  const emailResult = await sendBookingPaidEmail(booking.customerEmail, {
    reference: booking.reference,
    customerName: booking.customerName,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDate: booking.pickupDate,
    returnPickupDate: booking.returnPickupDate,
    journeyType: booking.journeyType,
    serviceType: booking.serviceType,
    driverName: booking.driver?.name ?? "Your driver",
    vehicleLabel: booking.driver?.vehicleLabel,
    amountPaid: booking.amountDue ?? booking.estimatedPrice,
  });

  if (!emailResult.ok) {
    console.error(`Payment confirmation email failed for ${reference}:`, emailResult.error);
  }

  return true;
}

export async function handleBookingCancelled(
  bookingId: string,
  cancellationReason: string
): Promise<{ ok: boolean; error?: string }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { driver: true },
  });

  if (!booking) {
    return { ok: false, error: "Booking not found" };
  }

  if (!booking.customerEmail) {
    return { ok: false, error: "Customer email not available" };
  }

  const emailResult = await sendBookingCancelledEmail(booking.customerEmail, {
    reference: booking.reference,
    customerName: booking.customerName,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDate: booking.pickupDate,
    driverName: booking.driver?.name ?? "Your driver",
    vehicleLabel: booking.driver?.vehicleLabel,
    cancellationReason,
    paymentStatus: booking.paymentStatus,
    amountPaid: booking.amountDue ?? booking.estimatedPrice,
  });

  if (!emailResult.ok) {
    console.error(`Cancellation email failed for ${booking.reference}:`, emailResult.error);
    return { ok: false, error: emailResult.error };
  }

  return { ok: true };
}

export function paymentLinkSkipMessage(result: EnsurePaymentLinkResult): string | null {
  if (result.created || result.paymentLinkUrl) return null;

  if (
    result.error?.includes("ORDERS_READ") ||
    result.error?.includes("INSUFFICIENT_SCOPES")
  ) {
    return "Your driver needs to reconnect Square in Driver Settings → Integrations (tap Reconnect Square and approve all permissions), then resend the payment link from the driver dashboard.";
  }

  switch (result.skipReason) {
    case "not_accepted":
      return "The driver must accept this booking before a payment link can be sent.";
    case "driver_not_connected":
      return "Your driver has not finished connecting Square for online payments. Ask them to connect Square in Driver Settings, then refresh this page.";
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
