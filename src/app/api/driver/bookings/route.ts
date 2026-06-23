import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { statusSchema } from "@/lib/validation";
import {
  canDriverManageBooking,
  driverBookingsFilter,
} from "@/lib/driver-access";
import {
  canSetEnRoute,
  handleBookingConfirmed,
} from "@/lib/booking-confirmation";

export async function GET() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: driverBookingsFilter(session),
    orderBy: { pickupDate: "asc" },
    include: { driver: { select: { name: true, vehicleLabel: true } } },
  });

  return NextResponse.json(bookings);
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
      parsed.data.status === "EN_ROUTE" &&
      !canSetEnRoute(existing.paymentStatus)
    ) {
      return NextResponse.json(
        { error: "Customer must pay online before the trip can be marked en route" },
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
