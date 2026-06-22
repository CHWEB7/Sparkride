"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fingerprint, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DriverAuthShell } from "@/components/driver/DriverAuthShell";

export function DriverLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notDriver = searchParams.get("error") === "not_driver";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePasskeySignIn() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPasskey();

      if (signInError) {
        throw signInError;
      }

      if (data.user?.app_metadata?.role !== "driver") {
        await supabase.auth.signOut();
        throw new Error("This account is not authorised for the driver portal.");
      }

      router.push("/driver/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Passkey sign-in failed. Try again or set up your passkey.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DriverAuthShell
      mode="login"
      title="Sign in"
      subtitle="Use Face ID, Touch ID, or your device PIN — no password needed."
    >
      <div className="space-y-4">
        {notDriver && (
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-800 text-sm">
            That account is for customers, not drivers. Use a driver passkey or set one up first.
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
        )}

        <button
          type="button"
          onClick={handlePasskeySignIn}
          disabled={loading}
          className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Fingerprint className="w-5 h-5" />
              Sign in with passkey
            </>
          )}
        </button>

        <p className="text-xs text-muted text-center leading-relaxed pt-1">
          Passkeys are phishing-resistant. Sparkride never sees your biometric data.
        </p>
      </div>
    </DriverAuthShell>
  );
}
