import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BOOKABLE_DRIVER_SEEDS,
  DEFAULT_DRIVER_PASSWORD,
  getDriverSeedPassword,
  TEST_DRIVER_PASSWORD,
} from "@/lib/bookable-drivers";
import { DRIVER_ROLE } from "@/lib/driver-auth";

export type DriverAuthSyncResult = {
  email: string;
  authUserId: string;
  action: "created" | "updated";
};

function bootstrapPasswordForEmail(email: string): string {
  const seed = BOOKABLE_DRIVER_SEEDS.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase()
  );
  if (seed) return getDriverSeedPassword(seed);
  if (email.toLowerCase() === "test@sparkride.co.uk") return TEST_DRIVER_PASSWORD;
  return process.env.DRIVER_PASSWORD || DEFAULT_DRIVER_PASSWORD;
}

async function findUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
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
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  password: string
) {
  const existing = await findUserByEmail(admin, email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      app_metadata: {
        ...(existing.app_metadata ?? {}),
        role: DRIVER_ROLE,
      },
      email_confirm: true,
    });
    if (error) throw error;
    return { user: data.user, action: "updated" as const };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: DRIVER_ROLE },
  });
  if (error) throw error;
  return { user: data.user, action: "created" as const };
}

export async function syncDriverAuthUser(
  email: string
): Promise<DriverAuthSyncResult> {
  const driver = await prisma.driver.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!driver) {
    throw new Error(
      `No driver row found for ${email}. Add them to the database first (npm run db:seed).`
    );
  }

  const admin = createAdminClient();
  const password = bootstrapPasswordForEmail(driver.email);
  const { user, action } = await upsertAuthUser(admin, driver.email, password);

  if (!user?.id) {
    throw new Error(`Failed to sync auth user for ${driver.email}`);
  }

  await prisma.driver.update({
    where: { id: driver.id },
    data: { authUserId: user.id },
  });

  return {
    email: driver.email,
    authUserId: user.id,
    action,
  };
}

export async function syncAllDriverAuthUsers(): Promise<DriverAuthSyncResult[]> {
  const drivers = await prisma.driver.findMany({ orderBy: { email: "asc" } });
  const results: DriverAuthSyncResult[] = [];

  for (const driver of drivers) {
    const result = await syncDriverAuthUser(driver.email);
    results.push(result);
  }

  return results;
}
