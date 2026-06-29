import { prisma } from "@/lib/prisma";
import { isPrismaMissingResourceError } from "@/lib/api-errors";

/** Calendar date in Europe/London as YYYY-MM-DD */
export function toLondonDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(date);
}

export function parseLondonDateInput(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

export async function isDriverBlockedOnLondonDate(
  driverId: string,
  londonDate: string
): Promise<boolean> {
  try {
    const probe = parseLondonDateInput(londonDate);
    const block = await prisma.driverBlockOut.findFirst({
      where: {
        driverId,
        startDate: { lte: probe },
        endDate: { gte: probe },
      },
      select: { id: true },
    });
    return Boolean(block);
  } catch (error) {
    if (isPrismaMissingResourceError(error)) {
      return false;
    }
    throw error;
  }
}

export async function isDriverAvailableForBooking(
  driverId: string,
  pickupDate: Date,
  returnPickupDate?: Date | null
): Promise<boolean> {
  const pickupDay = toLondonDateString(pickupDate);
  if (await isDriverBlockedOnLondonDate(driverId, pickupDay)) {
    return false;
  }

  if (returnPickupDate) {
    const returnDay = toLondonDateString(returnPickupDate);
    if (await isDriverBlockedOnLondonDate(driverId, returnDay)) {
      return false;
    }
  }

  return true;
}

export async function filterBookableDriverIds(
  driverIds: string[],
  pickupDate: Date,
  returnPickupDate?: Date | null
): Promise<string[]> {
  const available: string[] = [];
  for (const id of driverIds) {
    if (await isDriverAvailableForBooking(id, pickupDate, returnPickupDate)) {
      available.push(id);
    }
  }
  return available;
}
