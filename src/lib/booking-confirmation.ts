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

export function canSetEnRoute(paymentStatus: PaymentStatus): boolean {
  return paymentStatus !== "AWAITING_PAYMENT";
}

export async function handleBookingConfirmed(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { driver: true },
  });

  if (!booking?.customerEmail) return;

  let paymentLinkUrl: string | null = booking.squarePaymentLinkUrl;
  let paymentStatus: PaymentStatus = booking.paymentStatus;
  let amountDue = booking.amountDue ?? booking.estimatedPrice;

  const shouldCreateLink =
    isSquareConfigured() &&
    booking.driver &&
    driverHasSquareConnected(booking.driver) &&
    booking.estimatedPrice &&
    booking.estimatedPrice > 0 &&
    !booking.squarePaymentLinkUrl;

  if (shouldCreateLink && booking.driver) {
    const tokenResult = await getDriverAccessToken(booking.driver.id);
    if (tokenResult.ok) {
      const amountPence = Math.round(booking.estimatedPrice! * 100);
      const linkResult = await createSquarePaymentLink({
        accessToken: tokenResult.accessToken,
        locationId: tokenResult.locationId,
        reference: booking.reference,
        amountPence,
        description: `Sparkride ${booking.reference}`,
      });

      if (linkResult.ok) {
        paymentLinkUrl = linkResult.url;
        paymentStatus = "AWAITING_PAYMENT";
        amountDue = booking.estimatedPrice;

        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus,
            amountDue,
            squarePaymentLinkId: linkResult.id,
            squarePaymentLinkUrl: linkResult.url,
          },
        });
      } else {
        console.error("Square payment link creation failed:", linkResult.error);
        paymentStatus = "NOT_REQUIRED";
      }
    } else {
      console.error("Square access token unavailable:", tokenResult.error);
      paymentStatus = "NOT_REQUIRED";
    }
  } else if (!paymentLinkUrl && paymentStatus === "NOT_REQUIRED") {
    paymentStatus = "NOT_REQUIRED";
  }

  const emailResult = await sendBookingConfirmedEmail(booking.customerEmail, {
    reference: booking.reference,
    customerName: booking.customerName,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDate: booking.pickupDate,
    driverName: booking.driver?.name ?? "Your driver",
    vehicleLabel: booking.driver?.vehicleLabel,
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
