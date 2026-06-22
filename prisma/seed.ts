import { PrismaClient, VehicleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BOOKABLE_DRIVER_SEEDS = [
  {
    email: "lee@sparkride.co.uk",
    name: "Lee",
    phone: "07700 900101",
    vehicleLabel: "KIA Carnival (6 seater)",
    vehicleType: "MPV" as VehicleType,
    maxSeats: 6,
  },
  {
    email: "darren@sparkride.co.uk",
    name: "Darren",
    phone: "07700 900102",
    vehicleLabel: "Tesla Model 3 (4 seater)",
    vehicleType: "EXECUTIVE" as VehicleType,
    maxSeats: 4,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(process.env.DRIVER_PASSWORD || "driver123", 10);

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
    console.log("Seeded driver:", seed.name);
  }

  const legacyEmail = process.env.DRIVER_EMAIL || "driver@sparkride.co.uk";
  await prisma.driver.upsert({
    where: { email: legacyEmail },
    update: {},
    create: {
      email: legacyEmail,
      passwordHash,
      name: "Demo Driver",
      phone: "07700 900123",
      bookable: false,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
