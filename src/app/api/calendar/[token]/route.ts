import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCustomerCalendarEligible } from "@/lib/calendar/booking-events";
import { verifyCalendarDownloadToken } from "@/lib/calendar/calendar-tokens";
import {
  bookingToCalendarInput,
  createCalendarResponse,
} from "@/lib/calendar/calendar-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const payload = await verifyCalendarDownloadToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired calendar link" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { reference: payload.reference },
    include: { driver: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!isCustomerCalendarEligible(booking.status, booking.paymentStatus)) {
    return NextResponse.json(
      { error: "Calendar is available after payment is confirmed" },
      { status: 403 }
    );
  }

  return createCalendarResponse(
    bookingToCalendarInput(booking),
    "customer",
    payload.leg,
    "ics"
  );
}
