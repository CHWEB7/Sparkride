import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";
import { prisma } from "@/lib/prisma";
import { isCustomerCalendarEligible } from "@/lib/calendar/booking-events";
import {
  bookingToCalendarInput,
  createCalendarResponse,
} from "@/lib/calendar/calendar-response";
import type { CalendarLeg } from "@/lib/calendar/booking-events";

function parseCalendarQuery(req: NextRequest): { format: "ics" | "google"; leg: CalendarLeg } {
  const format = req.nextUrl.searchParams.get("format") === "google" ? "google" : "ics";
  const legParam = req.nextUrl.searchParams.get("leg");
  const leg: CalendarLeg =
    legParam === "outbound" || legParam === "return" ? legParam : "all";
  return { format, leg };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reference } = await params;
  const customer = await ensureCustomer(user);
  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { driver: true },
  });

  if (!booking || booking.customerId !== customer.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!isCustomerCalendarEligible(booking.status, booking.paymentStatus)) {
    return NextResponse.json(
      { error: "Calendar is available after payment is confirmed" },
      { status: 403 }
    );
  }

  const { format, leg } = parseCalendarQuery(req);
  return createCalendarResponse(bookingToCalendarInput(booking), "customer", leg, format);
}
