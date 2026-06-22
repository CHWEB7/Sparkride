import { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDailyMfaVerified } from "@/lib/mfa-session";

export async function getCustomerUserFromCookies(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCustomerUserFromRequest(
  req: NextRequest
): Promise<User | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createAdminClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  }

  return getCustomerUserFromCookies();
}

/** Returns user only when daily email MFA has been completed for today */
export async function getCustomerUserWithDailyMfa(
  req: NextRequest
): Promise<User | null> {
  const user = await getCustomerUserFromRequest(req);
  if (!user) return null;
  const verified = await isDailyMfaVerified(user.id, req);
  return verified ? user : null;
}
