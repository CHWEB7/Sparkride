import { useRouter } from "expo-router";
import { fetchMfaStatus, signOutWithMfaClear } from "./customer-auth";
import { supabase } from "./supabase";

function londonDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(date);
}

function signedInTodayLondon(lastSignInAt: string | undefined): boolean {
  if (!lastSignInAt) return true;
  const signInDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
  }).format(new Date(lastSignInAt));
  return signInDate === londonDateString();
}

/**
 * Ensures the user has completed daily email verification.
 * Signs out stale sessions from a previous day and routes to verify-2fa when needed.
 */
export async function ensureDailyMfaAccess(router: { replace: (path: string) => void }) {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) {
    router.replace("/login");
    return false;
  }

  if (!signedInTodayLondon(user.last_sign_in_at)) {
    await signOutWithMfaClear();
    router.replace("/login");
    return false;
  }

  const status = await fetchMfaStatus();
  if (!status.verified) {
    router.replace("/verify-2fa");
    return false;
  }

  return true;
}
