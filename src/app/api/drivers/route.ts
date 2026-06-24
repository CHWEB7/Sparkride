import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filterBookableDriverIds } from "@/lib/driver-availability";

/** Public list of bookable drivers for the customer booking wizard (no credentials). */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pickupDateStr = searchParams.get("pickupDate");
  const pickupTimeStr = searchParams.get("pickupTime");
  const returnDateStr = searchParams.get("returnDate");
  const returnTimeStr = searchParams.get("returnTime");

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

  if (!pickupDateStr || !pickupTimeStr) {
    return NextResponse.json(drivers);
  }

  const pickupDate = new Date(`${pickupDateStr}T${pickupTimeStr}:00`);
  if (Number.isNaN(pickupDate.getTime())) {
    return NextResponse.json(drivers);
  }

  let returnPickupDate: Date | null = null;
  if (returnDateStr && returnTimeStr) {
    returnPickupDate = new Date(`${returnDateStr}T${returnTimeStr}:00`);
    if (Number.isNaN(returnPickupDate.getTime())) {
      returnPickupDate = null;
    }
  }

  const availableIds = await filterBookableDriverIds(
    drivers.map((d) => d.id),
    pickupDate,
    returnPickupDate
  );
  const availableSet = new Set(availableIds);

  return NextResponse.json(drivers.filter((d) => availableSet.has(d.id)));
}
