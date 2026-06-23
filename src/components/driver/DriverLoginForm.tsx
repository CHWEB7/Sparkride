"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DriverAuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/driver/DriverAuthShell";

type Step = "credentials" | "mfa";

export function DriverLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notDriver = searchParams.get("error") === "not_driver";
  const mfaRequired = searchParams.get("mfa") === "required";

  const [step, setStep] = useState<Step>(mfaRequired ? "mfa" : "credentials");
  const [bootstrappingMfa, setBootstrappingMfa] = useState(mfaRequired);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
          setStep("credentials");
          return;
        }

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
        setStep("credentials");
      } finally {
        setBootstrappingMfa(false);
      }
    }

    prepareMfaStep();
  }, [mfaRequired, router]);

  async function assertDriverRole(supabase: ReturnType<typeof createClient>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.app_metadata?.role !== "driver") {
      await supabase.auth.signOut();
      throw new Error("This account is not authorised for the driver portal.");
    }
    return user;
  }

  async function handleCredentials(e: React.FormEvent) {
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
          ? "Invalid email or password. First-time drivers should use Set up authenticator."
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

  return (
    <DriverAuthShell
      mode="login"
      title={step === "credentials" ? "Sign in" : "Authenticator code"}
      subtitle={
        step === "credentials"
          ? "Use your driver email and password, then confirm with your MFA app."
          : "Enter the 6-digit code from your authenticator app."
      }
    >
      <div className="space-y-4">
        {notDriver && (
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-800 text-sm">
            That account is for customers, not drivers.
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
        )}

        {bootstrappingMfa ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-7 h-7 text-brand animate-spin" />
          </div>
        ) : step === "credentials" ? (
          <form onSubmit={handleCredentials} className="space-y-4">
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
              <label className={authLabelClass}>Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={authInputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
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
          <form onSubmit={handleMfa} className="space-y-4">
            <div>
              <label className={authLabelClass}>6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={authInputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  Verify and sign in
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setMfaCode("");
                setError("");
              }}
              className="w-full text-sm font-medium text-muted hover:text-dark transition-colors"
            >
              Back to email and password
            </button>
          </form>
        )}

        <p className="text-xs text-muted text-center leading-relaxed pt-1">
          MFA is required for every driver sign-in. Sparkride never sees your authenticator
          secret.
        </p>
      </div>
    </DriverAuthShell>
  );
}
