import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { statusSchema } from "@/lib/validation";
import {
  canDriverManageBooking,
  driverBookingsFilter,
} from "@/lib/driver-access";
import {
  canSetPaid,
  handleBookingConfirmed,
} from "@/lib/booking-confirmation";
import { isCalendarBookingStatus } from "@/lib/booking-status";

export async function GET(req: NextRequest) {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calendar = req.nextUrl.searchParams.get("calendar") === "1";

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ...driverBookingsFilter(session),
        ...(calendar
          ? {
              paymentStatus: { in: ["PAID", "NOT_REQUIRED"] },
            }
          : {}),
      },
      orderBy: { pickupDate: "asc" },
      include: { driver: { select: { name: true, vehicleLabel: true } } },
    });

    if (!calendar) {
      return NextResponse.json(bookings);
    }

    const paidBookings = bookings.filter((booking) =>
      isCalendarBookingStatus(booking.status)
    );
    return NextResponse.json(paidBookings);
  } catch (error) {
    console.error("Driver bookings fetch error:", error);
    if (calendar) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    const parsed = statusSchema.safeParse({ status });
    if (!parsed.success || !id) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { driver: { select: { name: true, vehicleLabel: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!canDriverManageBooking(session, existing.driverId)) {
      return NextResponse.json(
        { error: "You can only update bookings assigned to you" },
        { status: 403 }
      );
    }

    if (
      parsed.data.status === "PAID" &&
      !canSetPaid(existing.paymentStatus)
    ) {
      return NextResponse.json(
        { error: "Customer must pay online before the trip can be marked paid" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { driver: { select: { name: true, vehicleLabel: true } } },
    });

    const justConfirmed =
      parsed.data.status === "CONFIRMED" && existing.status !== "CONFIRMED";

    if (justConfirmed) {
      await handleBookingConfirmed(booking.id);
    }

    const refreshed = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { driver: { select: { name: true, vehicleLabel: true } } },
    });

    return NextResponse.json(refreshed ?? booking);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 400 });
  }
}
