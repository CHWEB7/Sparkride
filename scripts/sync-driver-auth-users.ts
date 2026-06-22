/**
 * Creates or updates Supabase Auth users for all Prisma drivers and links authUserId.
 *
 * Run after deploy or when adding drivers:
 *   npx tsx scripts/sync-driver-auth-users.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and database env vars in .env / .env.local
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import {
  BOOKABLE_DRIVER_SEEDS,
  DEFAULT_DRIVER_PASSWORD,
  getDriverSeedPassword,
  TEST_DRIVER_PASSWORD,
} from "../src/lib/bookable-drivers";

config({ path: ".env.local" });
config();

const DRIVER_ROLE = "driver";
const prisma = new PrismaClient();

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      experimental: { passkey: true },
    },
  });
}

function bootstrapPasswordForEmail(email: string): string {
  const seed = BOOKABLE_DRIVER_SEEDS.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase()
  );
  if (seed) return getDriverSeedPassword(seed);
  if (email.toLowerCase() === "test@sparkride.co.uk") return TEST_DRIVER_PASSWORD;
  return process.env.DRIVER_PASSWORD || DEFAULT_DRIVER_PASSWORD;
}

async function findUserByEmail(
  admin: ReturnType<typeof getSupabaseAdmin>,
  email: string
) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;
    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function upsertAuthUser(
  admin: ReturnType<typeof getSupabaseAdmin>,
  email: string,
  password: string
) {
  const existing = await findUserByEmail(admin, email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      app_metadata: { role: DRIVER_ROLE },
      email_confirm: true,
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: DRIVER_ROLE },
  });
  if (error) throw error;
  return data.user;
}

async function main() {
  const admin = getSupabaseAdmin();
  const drivers = await prisma.driver.findMany({ orderBy: { email: "asc" } });

  if (drivers.length === 0) {
    console.log("No drivers in database. Run: npx prisma db seed");
    return;
  }

  for (const driver of drivers) {
    const password = bootstrapPasswordForEmail(driver.email);
    const authUser = await upsertAuthUser(admin, driver.email, password);

    if (!authUser?.id) {
      console.error("Failed to sync:", driver.email);
      continue;
    }

    await prisma.driver.update({
      where: { id: driver.id },
      data: { authUserId: authUser.id },
    });

    console.log("Synced driver auth:", driver.email, "→", authUser.id);
  }

  console.log("\nDone. Drivers must visit /driver/enroll once to register a passkey.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
