import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DRIVER_EMAIL || "driver@sparkride.co.uk";
  const password = process.env.DRIVER_PASSWORD || "driver123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.driver.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: "Demo Driver",
      phone: "07700 900123",
    },
  });

  console.log("Seeded driver account:", email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
