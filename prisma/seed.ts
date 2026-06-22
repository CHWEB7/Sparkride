import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  BOOKABLE_DRIVER_SEEDS,
  DEFAULT_DRIVER_PASSWORD,
  getDriverSeedPassword,
} from "../src/lib/bookable-drivers";

const prisma = new PrismaClient();

async function main() {
  for (const seed of BOOKABLE_DRIVER_SEEDS) {
    const passwordHash = await bcrypt.hash(getDriverSeedPassword(seed), 10);
    await prisma.driver.upsert({
      where: { email: seed.email },
      update: {
        name: seed.name,
        phone: seed.phone,
        vehicleLabel: seed.vehicleLabel,
        vehicleType: seed.vehicleType,
        maxSeats: seed.maxSeats,
        bookable: true,
        passwordHash,
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
    console.log("Seeded driver:", seed.name, seed.email);
  }

  const legacyHash = await bcrypt.hash(
    process.env.DRIVER_PASSWORD || DEFAULT_DRIVER_PASSWORD,
    10
  );
  const legacyEmail = process.env.DRIVER_EMAIL || "driver@sparkride.co.uk";
  await prisma.driver.upsert({
    where: { email: legacyEmail },
    update: { passwordHash: legacyHash },
    create: {
      email: legacyEmail,
      passwordHash: legacyHash,
      name: "Demo Driver",
      phone: "07700 900123",
      bookable: false,
    },
  });
  console.log("Seeded legacy driver:", legacyEmail);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
