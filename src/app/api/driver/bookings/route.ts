import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriverSession } from "@/lib/auth";
import { statusSchema } from "@/lib/validation";

export async function GET() {
  const session = await getDriverSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { pickupDate: "asc" },
    include: { driver: { select: { name: true } } },
  });

  return NextResponse.json(bookings);
}

export async function PATCH(req: NextRequest) {
  const session = await getDriverSession();
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

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: parsed.data.status,
        driverId: session.driverId,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
