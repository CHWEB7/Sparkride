"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fingerprint, Loader2, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DriverLoginForm() {
  const router = useRouter();
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
        err instanceof Error ? err.message : "Passkey sign-in failed. Try again or set up your passkey.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Sparkride</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Driver portal</h1>
          <p className="mt-2 text-gray-400 text-sm">
            Sign in with your passkey to access assigned bookings
          </p>
        </div>

        <div className="bg-dark-elevated rounded-2xl p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
          )}

          <button
            type="button"
            onClick={handlePasskeySignIn}
            disabled={loading}
            className="w-full py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
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

          <p className="text-center text-sm text-gray-400">
            First time on this device?{" "}
            <Link href="/driver/enroll" className="text-brand-end hover:underline">
              Set up your passkey
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-gray-500 text-xs leading-relaxed">
          Passkeys use Face ID, Touch ID, or your device PIN. Sparkride never sees your biometric data.
        </p>
      </div>
    </div>
  );
}
