"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DriverAuthShell,
  driverAuthButtonClass,
  driverAuthInputClass,
} from "@/components/driver/DriverAuthShell";
import { DriverTotpSetup } from "@/components/driver/DriverTotpSetup";
import { DriverSetPasswordForm } from "@/components/driver/DriverSetPasswordForm";

type Step = "bootstrap" | "mfa" | "password";

function driverPasswordIsSet(user: { user_metadata?: Record<string, unknown> }) {
  return user.user_metadata?.driver_password_set === true;
}

export function DriverEnrollForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordReset = searchParams.get("reset") === "1";
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
        const hasVerifiedTotp =
          factors?.totp?.some((factor) => factor.status === "verified") ?? false;

        if (passwordReset && hasVerifiedTotp) {
          setStep("password");
          setLoading(false);
          return;
        }

        if (hasVerifiedTotp) {
          if (!driverPasswordIsSet(user)) {
            setStep("password");
            setLoading(false);
            return;
          }

          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aal?.currentLevel === "aal2") {
            router.replace("/driver/dashboard");
            return;
          }
        }

        if (hasVerifiedTotp) {
          setStep("password");
        } else {
          setStep("mfa");
        }
      }

      setLoading(false);
    }

    checkSession();
  }, [router, passwordReset]);

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
        const claimRes = await fetch("/api/driver/ensure-role", { method: "POST" });
        if (claimRes.ok) {
          await supabase.auth.refreshSession();
          const {
            data: { user: refreshed },
          } = await supabase.auth.getUser();
          if (refreshed?.app_metadata?.role === "driver") {
            setStep("mfa");
            return;
          }
        }
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
    setStep("password");
  }

  function handlePasswordComplete() {
    router.push("/driver/dashboard");
    router.refresh();
  }

  const titles: Record<Step, string> = {
    bootstrap: "Verify your account",
    mfa: "Set up authenticator",
    password: "Choose your password",
  };

  const subtitles: Record<Step, string> = {
    bootstrap: "Sign in once with your one-time password from Sparkride.",
    mfa: "Scan the QR code with your MFA app. This is required before you can access bookings.",
    password:
      "Replace your one-time password with a personal password you will use for future sign-ins.",
  };

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
      title={titles[step]}
      subtitle={subtitles[step]}
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {step === "bootstrap" ? (
        <form onSubmit={handleBootstrap} className="space-y-4">
          <div>
            <label htmlFor="enroll-email" className="sr-only">
              Email
            </label>
            <input
              id="enroll-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={driverAuthInputClass}
            />
          </div>
          <div>
            <label htmlFor="enroll-password" className="sr-only">
              One-time password
            </label>
            <input
              id="enroll-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your one-time password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={driverAuthInputClass}
            />
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Provided by Sparkride when your driver account was created. You will choose a new
              password after MFA setup.
            </p>
          </div>
          <button type="submit" disabled={submitting} className={driverAuthButtonClass}>
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <KeyRound className="h-5 w-5" />
                Continue
              </>
            )}
          </button>
        </form>
      ) : step === "mfa" ? (
        <DriverTotpSetup onComplete={handleMfaComplete} />
      ) : (
        <DriverSetPasswordForm onComplete={handlePasswordComplete} />
      )}
    </DriverAuthShell>
  );
}
