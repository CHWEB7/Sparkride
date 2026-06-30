"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/site-url";
import type { CustomerProfile } from "@/lib/customer";
import { CustomerEmailVerifyPanel } from "@/components/customer/CustomerEmailVerifyPanel";
import {
  squareButtonPrimaryClass,
  squareInputClass,
  squareLabelClass,
} from "@/components/booking/booking-square-styles";

type BookingAccountPanelProps = {
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  verifyOnly?: boolean;
  onAuthenticated: (profile: CustomerProfile) => void;
};

type AuthMode = "signin" | "signup";
type AuthStep = "credentials" | "verify";

export function BookingAccountPanel({
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  verifyOnly = false,
  onAuthenticated,
}: BookingAccountPanelProps) {
  const [step, setStep] = useState<AuthStep>(verifyOnly ? "verify" : "credentials");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(verifyOnly);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/customer/profile");
    if (!res.ok) {
      throw new Error("Could not load your account");
    }
    const profile = (await res.json()) as CustomerProfile;
    onAuthenticated(profile);
  }, [onAuthenticated]);

  useEffect(() => {
    if (!verifyOnly) return;

    async function prepareVerifyStep() {
      setBootstrapping(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
          setStep("credentials");
          return;
        }

        const statusRes = await fetch("/api/auth/mfa/status");
        if (statusRes.ok) {
          const data = (await statusRes.json()) as { verified?: boolean };
          if (data.verified) {
            await loadProfile();
            return;
          }
        }

        setEmail(user.email);
        setStep("verify");
      } catch {
        setStep("credentials");
      } finally {
        setBootstrapping(false);
      }
    }

    prepareVerifyStep();
  }, [verifyOnly, loadProfile]);

  async function continueAfterAuth(userEmail: string) {
    try {
      const statusRes = await fetch("/api/auth/mfa/status");
      if (statusRes.ok) {
        const data = (await statusRes.json()) as { verified?: boolean };
        if (data.verified) {
          await loadProfile();
          return;
        }
      }

      setEmail(userEmail);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user?.email) {
      await continueAfterAuth(data.user.email);
      return;
    }

    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const formattedPhone = phone.trim()
      ? `+44${phone.replace(/\s/g, "").replace(/^0/, "")}`
      : phone;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone: formattedPhone,
        },
        emailRedirectTo: getAuthCallbackUrl("/book"),
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session && data.user?.email) {
      await fetch("/api/customer/profile", { method: "POST" });
      await continueAfterAuth(data.user.email);
      return;
    }

    setMessage(
      "We sent a verification link to your email. Open it, then sign in here to continue."
    );
    setMode("signin");
    setLoading(false);
  }

  async function handleVerified() {
    setLoading(true);
    setError("");
    try {
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your account");
      setLoading(false);
    }
  }

  if (bootstrapping) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-7 w-7 animate-spin text-brand" />
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Before continuing with your booking, verify your email with the one-time code we send to
          your inbox.
        </p>
        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}
        <CustomerEmailVerifyPanel
          email={email}
          redirect="/book"
          onVerified={handleVerified}
          onBack={
            verifyOnly
              ? undefined
              : () => {
                  setStep("credentials");
                  setError("");
                }
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex border border-gray-300 dark:border-white/15">
        {(["signin", "signup"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setMode(tab);
              setError("");
              setMessage("");
            }}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              mode === tab
                ? "bg-brand text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-dark dark:text-gray-300 dark:hover:bg-white/5"
            }`}
          >
            {tab === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 border border-brand/30 bg-brand-light/30 px-4 py-3 text-sm text-gray-800 dark:bg-brand/10 dark:text-gray-200">
          {message}
        </div>
      )}

      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className={squareLabelClass}>Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={squareInputClass}
            />
          </div>
          <div>
            <label className={squareLabelClass}>Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={squareInputClass}
            />
          </div>
          <button type="submit" disabled={loading} className={`w-full ${squareButtonPrimaryClass}`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className={squareLabelClass}>Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={squareInputClass}
            />
          </div>
          <div>
            <label className={squareLabelClass}>Phone number</label>
            <input
              type="tel"
              required
              placeholder="07xxx xxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={squareInputClass}
            />
          </div>
          <div>
            <label className={squareLabelClass}>Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={squareInputClass}
            />
          </div>
          <div>
            <label className={squareLabelClass}>Password</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={squareInputClass}
            />
          </div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 border-gray-300 text-brand"
            />
            <span className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              I agree to Sparkride&apos;s{" "}
              <Link href="/terms" className="font-medium text-brand hover:underline">
                Terms &amp; conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-brand hover:underline">
                Privacy policy
              </Link>
              .
            </span>
          </label>
          <button type="submit" disabled={loading} className={`w-full ${squareButtonPrimaryClass}`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </button>
        </form>
      )}
    </div>
  );
}
