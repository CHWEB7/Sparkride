import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriverSessionFromRequest } from "@/lib/driver-auth";
import { canDriverManageBooking } from "@/lib/driver-access";
import { isCalendarEligibleBooking } from "@/lib/booking-status";
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
  const session = await getDriverSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reference } = await params;
  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { driver: true },
  });

  if (!booking || !canDriverManageBooking(session, booking.driverId)) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!isCalendarEligibleBooking(booking.status, booking.paymentStatus)) {
    return NextResponse.json(
      { error: "This booking is not ready for calendar export" },
      { status: 403 }
    );
  }

  const { format, leg } = parseCalendarQuery(req);
  return createCalendarResponse(bookingToCalendarInput(booking), "driver", leg, format);
}
