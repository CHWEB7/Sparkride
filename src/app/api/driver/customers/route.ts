import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { driverBookingsFilter } from "@/lib/driver-access";

export async function GET() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ...driverBookingsFilter(session),
        customerId: { not: null },
      },
      select: { customerId: true },
      distinct: ["customerId"],
    });

    const customerIds = bookings
      .map((b) => b.customerId)
      .filter((id): id is string => Boolean(id));

    if (customerIds.length === 0) {
      return NextResponse.json([]);
    }

    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      include: {
        bookings: {
          where: driverBookingsFilter(session),
          select: { id: true, status: true, pickupDate: true, reference: true },
          orderBy: { pickupDate: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const payload = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      bookingCount: customer.bookings.length,
      lastBooking: customer.bookings[0] ?? null,
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Driver customers fetch error:", error);
    return NextResponse.json({ error: "Failed to load customers" }, { status: 500 });
  }
}
