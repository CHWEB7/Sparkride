"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/site-url";
import {
  DriverAuthShell,
  driverAuthButtonClass,
  driverAuthChipClass,
  driverAuthInputClass,
} from "@/components/driver/DriverAuthShell";

type Step = "email" | "password" | "mfa";

export function DriverLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notDriver = searchParams.get("error") === "not_driver";
  const mfaRequired = searchParams.get("mfa") === "required";

  const [step, setStep] = useState<Step>(mfaRequired ? "mfa" : "email");
  const [bootstrappingMfa, setBootstrappingMfa] = useState(mfaRequired);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  useEffect(() => {
    if (!mfaRequired) return;

    async function prepareMfaStep() {
      setBootstrappingMfa(true);
      setError("");

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || user.app_metadata?.role !== "driver") {
          setStep("email");
          return;
        }

        setEmail(user.email ?? "");

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        const totpFactor = factors?.totp?.[0];
        if (!totpFactor) {
          router.replace("/driver/enroll");
          return;
        }

        setFactorId(totpFactor.id);
        setStep("mfa");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not prepare MFA sign-in. Sign in again."
        );
        setStep("email");
      } finally {
        setBootstrappingMfa(false);
      }
    }

    prepareMfaStep();
  }, [mfaRequired, router]);

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Enter your email first");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthCallbackUrl("/driver/enroll?reset=1"),
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Password reset email sent — open the link to choose a new password.");
    }
    setLoading(false);
  }

  async function assertDriverRole(supabase: ReturnType<typeof createClient>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.app_metadata?.role === "driver") return user;

    const claimRes = await fetch("/api/driver/ensure-role", { method: "POST" });
    if (claimRes.ok) {
      await supabase.auth.refreshSession();
      const {
        data: { user: refreshed },
      } = await supabase.auth.getUser();
      if (refreshed?.app_metadata?.role === "driver") return refreshed;
    }

    await supabase.auth.signOut();
    throw new Error("This account is not authorised for the driver portal.");
  }

  function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Enter your email address");
      return;
    }
    setStep("password");
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      await assertDriverRole(supabase);

      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) {
        router.push("/driver/enroll");
        router.refresh();
        return;
      }

      const { data: aal, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      if (aal?.currentLevel === "aal2") {
        router.push("/driver/dashboard");
        router.refresh();
        return;
      }

      setFactorId(totpFactor.id);
      setStep("mfa");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Sign-in failed";
      const message =
        raw.toLowerCase().includes("invalid login credentials")
          ? "Invalid email or password."
          : raw;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: mfaCode.trim(),
      });
      if (verifyError) throw verifyError;

      await assertDriverRole(supabase);
      router.push("/driver/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid authenticator code. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Step, string> = {
    email: "Welcome back",
    password: "Enter your password",
    mfa: "Authenticator code",
  };

  const subtitles: Record<Step, string> = {
    email: "Sign in to your driver account to continue",
    password: "Enter the password for your Sparkride driver account",
    mfa: "Enter the 6-digit code from your authenticator app",
  };

  return (
    <DriverAuthShell mode="login" title={titles[step]} subtitle={subtitles[step]}>
      <div className="space-y-4">
        {notDriver && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            That account is for customers, not drivers.
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        {message && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}

        {bootstrappingMfa ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-brand" />
          </div>
        ) : step === "email" ? (
          <form onSubmit={handleEmailContinue} className="space-y-4">
            <div>
              <label htmlFor="driver-email" className="sr-only">
                Email
              </label>
              <input
                id="driver-email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={driverAuthInputClass}
              />
            </div>
            <button type="submit" className={driverAuthButtonClass}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : step === "password" ? (
          <form onSubmit={handlePassword} className="space-y-4">
            <div className={driverAuthChipClass}>
              <span className="text-gray-500">Signing in as </span>
              <span className="font-medium text-gray-900">{email}</span>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setError("");
                }}
                className="ml-2 font-medium text-brand hover:underline"
              >
                Change
              </button>
            </div>
            <div>
              <label htmlFor="driver-password" className="sr-only">
                Password
              </label>
              <input
                id="driver-password"
                type="password"
                required
                autoComplete="current-password"
                autoFocus
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={driverAuthInputClass}
              />
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
            >
              Forgot password?
            </button>
            <button type="submit" disabled={loading} className={driverAuthButtonClass}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfa} className="space-y-4">
            <div className={driverAuthChipClass}>
              <span className="text-gray-500">Account </span>
              <span className="font-medium text-gray-900">{email}</span>
            </div>
            <div>
              <label htmlFor="driver-mfa" className="sr-only">
                6-digit code
              </label>
              <input
                id="driver-mfa"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`${driverAuthInputClass} text-center text-lg tracking-[0.3em]`}
              />
            </div>
            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className={driverAuthButtonClass}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Smartphone className="h-5 w-5" />
                  Verify and sign in
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("password");
                setMfaCode("");
                setError("");
              }}
              className="w-full text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
            >
              Back to password
            </button>
          </form>
        )}

        <p className="text-center text-xs leading-relaxed text-gray-500">
          MFA is required for every driver sign-in. Sparkride never sees your authenticator secret.
        </p>
      </div>
    </DriverAuthShell>
  );
}
