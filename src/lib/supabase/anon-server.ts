import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Server-side anon client for auth actions that must trigger Supabase emails
 * (e.g. signInWithOtp). The service-role client does not send auth emails.
 */
export function createAnonServerClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
