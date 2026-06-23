import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function driverHasVerifiedTotp(authUserId: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.mfa.listFactors({
      userId: authUserId,
    });
    if (error) {
      console.error("Driver MFA list error:", error.message);
      return false;
    }
    return (
      data?.factors?.some(
        (factor) => factor.factor_type === "totp" && factor.status === "verified"
      ) ?? false
    );
  } catch (error) {
    console.error("Driver MFA list failed:", error);
    return false;
  }
}

export async function driverSessionIsMfaComplete(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return false;
  return data.currentLevel === "aal2";
}
