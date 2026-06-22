import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDriverSessionWithPasskey } from "@/lib/driver-auth";
import { statusSchema } from "@/lib/validation";
import {
  canDriverManageBooking,
  driverBookingsFilter,
} from "@/lib/driver-access";
import { sendBookingConfirmedEmail } from "@/lib/send-booking-email";

export async function GET() {
  const session = await requireDriverSessionWithPasskey();
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
  const session = await requireDriverSessionWithPasskey();
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

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { driver: { select: { name: true, vehicleLabel: true } } },
    });

    const justConfirmed =
      parsed.data.status === "CONFIRMED" && existing.status !== "CONFIRMED";

    if (justConfirmed && booking.customerEmail) {
      const emailResult = await sendBookingConfirmedEmail(booking.customerEmail, {
        reference: booking.reference,
        customerName: booking.customerName,
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
        pickupDate: booking.pickupDate,
        driverName: booking.driver?.name ?? session.name,
        vehicleLabel: booking.driver?.vehicleLabel,
        estimatedPrice: booking.estimatedPrice,
      });

      if (!emailResult.ok) {
        console.error("Booking confirmation email failed:", emailResult.error);
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 400 });
  }
}
