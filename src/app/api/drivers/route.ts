import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { BOOKABLE_DRIVER_SEEDS } from "@/lib/bookable-drivers";

export async function GET() {
  const passwordHash = await bcrypt.hash("driver123", 10);

  for (const seed of BOOKABLE_DRIVER_SEEDS) {
    await prisma.driver.upsert({
      where: { email: seed.email },
      update: {
        name: seed.name,
        phone: seed.phone,
        vehicleLabel: seed.vehicleLabel,
        vehicleType: seed.vehicleType,
        maxSeats: seed.maxSeats,
        bookable: true,
      },
      create: {
        email: seed.email,
        passwordHash,
        name: seed.name,
        phone: seed.phone,
        vehicleLabel: seed.vehicleLabel,
        vehicleType: seed.vehicleType,
        maxSeats: seed.maxSeats,
        bookable: true,
      },
    });
  }

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
