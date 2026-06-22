import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public list of bookable drivers for the customer booking wizard (no credentials). */
export async function GET() {
  const drivers = await prisma.driver.findMany({
    where: { bookable: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      vehicleLabel: true,
      vehicleType: true,
      maxSeats: true,
    },
  });

  return NextResponse.json(drivers);
}
