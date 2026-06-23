"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DriverAuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/driver/DriverAuthShell";
import { DriverTotpSetup } from "@/components/driver/DriverTotpSetup";

type Step = "bootstrap" | "mfa";

export function DriverEnrollForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("bootstrap");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.app_metadata?.role === "driver") {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if ((factors?.totp?.length ?? 0) > 0) {
          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aal?.currentLevel === "aal2") {
            router.replace("/driver/dashboard");
            return;
          }
        }
        setStep("mfa");
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      if (data.user?.app_metadata?.role !== "driver") {
        await supabase.auth.signOut();
        throw new Error("This account is not authorised for the driver portal.");
      }

      setStep("mfa");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Sign-in failed";
      const message =
        raw.toLowerCase().includes("invalid login credentials")
          ? "No driver account found in Supabase Auth yet, or the one-time password is wrong. Ask your admin to run the driver auth sync, then try again."
          : raw;
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleMfaComplete() {
    router.push("/driver/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#12151c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-end animate-spin" />
      </div>
    );
  }

  return (
    <DriverAuthShell
      mode="enroll"
      title={step === "bootstrap" ? "Verify your account" : "Set up authenticator"}
      subtitle={
        step === "bootstrap"
          ? "Sign in once with your one-time password from Sparkride."
          : "Scan the QR code with your MFA app. This is required before you can access bookings."
      }
    >
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm mb-4">{error}</div>
      )}

      {step === "bootstrap" ? (
        <form onSubmit={handleBootstrap} className="space-y-4">
          <div>
            <label className={authLabelClass}>Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label className={authLabelClass}>One-time password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your one-time password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Provided by Sparkride when your driver account was created. Used only for this
              one-time setup.
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                Continue
              </>
            )}
          </button>
        </form>
      ) : (
        <DriverTotpSetup onComplete={handleMfaComplete} />
      )}
    </DriverAuthShell>
  );
}
