import { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  driverHasVerifiedTotp,
  driverSessionIsMfaComplete,
} from "@/lib/driver-mfa";

export type DriverSession = {
  driverId: string;
  authUserId: string;
  email: string;
  name: string;
};

export const DRIVER_ROLE = "driver";

export function isDriverUser(user: User | null | undefined): user is User {
  return user?.app_metadata?.role === DRIVER_ROLE;
}

export async function getDriverUserFromCookies(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isDriverUser(user) ? user : null;
}

export async function getDriverUserFromRequest(req: NextRequest): Promise<User | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createAdminClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user || !isDriverUser(user)) return null;
    return user;
  }

  return getDriverUserFromCookies();
}

async function resolveDriverRecord(user: User) {
  return prisma.driver.findFirst({
    where: {
      OR: [{ authUserId: user.id }, { email: user.email ?? "" }],
    },
  });
}

export async function getDriverSession(): Promise<DriverSession | null> {
  const user = await getDriverUserFromCookies();
  if (!user) return null;

  const driver = await resolveDriverRecord(user);
  if (!driver) return null;

  if (driver.authUserId !== user.id) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { authUserId: user.id },
    });
  }

  return {
    driverId: driver.id,
    authUserId: user.id,
    email: driver.email,
    name: driver.name,
  };
}

export async function getDriverSessionFromRequest(
  req: NextRequest
): Promise<DriverSession | null> {
  const user = await getDriverUserFromRequest(req);
  if (!user) return null;

  const driver = await resolveDriverRecord(user);
  if (!driver) return null;

  return {
    driverId: driver.id,
    authUserId: user.id,
    email: driver.email,
    name: driver.name,
  };
}

export async function requireDriverSessionWithMfa(): Promise<DriverSession | null> {
  const session = await getDriverSession();
  if (!session) return null;

  const hasTotp = await driverHasVerifiedTotp(session.authUserId);
  if (!hasTotp) return null;

  const mfaComplete = await driverSessionIsMfaComplete();
  if (!mfaComplete) return null;

  return session;
}

export async function signOutDriver() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
