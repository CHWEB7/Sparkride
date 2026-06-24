import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import {
  canDriverAction,
  statusForDriverAction,
} from "@/lib/driver-booking-actions";
import { driverBookingActionSchema } from "@/lib/validation";
import {
  canDriverManageBooking,
  driverBookingsFilter,
} from "@/lib/driver-access";
import {
  handleBookingAccepted,
  sendBookingPaymentLinkEmail,
} from "@/lib/booking-confirmation";
import { isCalendarEligibleBooking } from "@/lib/booking-status";

export async function GET(req: NextRequest) {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calendar = req.nextUrl.searchParams.get("calendar") === "1";

  try {
    const bookings = await prisma.booking.findMany({
      where: driverBookingsFilter(session),
      orderBy: { pickupDate: "asc" },
      include: { driver: { select: { name: true, vehicleLabel: true } } },
    });

    if (!calendar) {
      return NextResponse.json(bookings);
    }

    const calendarBookings = bookings.filter((booking) =>
      isCalendarEligibleBooking(booking.status, booking.paymentStatus)
    );
    return NextResponse.json(calendarBookings);
  } catch (error) {
    console.error("Driver bookings fetch error:", error);
    if (calendar) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = driverBookingActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { action, ids } = parsed.data;
    const results: Array<{
      id: string;
      ok: boolean;
      error?: string;
      booking?: unknown;
    }> = [];

    for (const id of ids) {
      const existing = await prisma.booking.findUnique({
        where: { id },
        include: { driver: { select: { name: true, vehicleLabel: true } } },
      });

      if (!existing) {
        results.push({ id, ok: false, error: "Booking not found" });
        continue;
      }

      if (!canDriverManageBooking(session, existing.driverId)) {
        results.push({ id, ok: false, error: "Not authorized for this booking" });
        continue;
      }

      if (!canDriverAction(existing, action)) {
        results.push({
          id,
          ok: false,
          error: `Cannot ${action.replace(/_/g, " ")} for this booking status`,
        });
        continue;
      }

      if (action === "send_payment_link") {
        const sendResult = await sendBookingPaymentLinkEmail(id);
        if (!sendResult.ok) {
          results.push({ id, ok: false, error: sendResult.error });
          continue;
        }
        const refreshed = await prisma.booking.findUnique({
          where: { id },
          include: { driver: { select: { name: true, vehicleLabel: true } } },
        });
        results.push({ id, ok: true, booking: refreshed });
        continue;
      }

      const nextStatus = statusForDriverAction(action);
      if (!nextStatus) {
        results.push({ id, ok: false, error: "Invalid action" });
        continue;
      }

      await prisma.booking.update({
        where: { id },
        data: { status: nextStatus },
      });

      if (action === "accept") {
        await handleBookingAccepted(id);
      }

      const refreshed = await prisma.booking.findUnique({
        where: { id },
        include: { driver: { select: { name: true, vehicleLabel: true } } },
      });
      results.push({ id, ok: true, booking: refreshed });
    }

    const allOk = results.every((r) => r.ok);
    return NextResponse.json(
      { results },
      { status: allOk ? 200 : 207 }
    );
  } catch (error) {
    console.error("Driver booking action error:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
