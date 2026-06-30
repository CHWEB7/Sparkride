"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/site-url";
import type { CustomerProfile } from "@/lib/customer";
import {
  squareButtonPrimaryClass,
  squareInputClass,
  squareLabelClass,
} from "@/components/booking/booking-square-styles";

type BookingAccountPanelProps = {
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  onAuthenticated: (profile: CustomerProfile) => void;
};

type AuthMode = "signin" | "signup";

export function BookingAccountPanel({
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  onAuthenticated,
}: BookingAccountPanelProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function loadProfile() {
    const res = await fetch("/api/customer/profile");
    if (!res.ok) {
      throw new Error("Could not load your account");
    }
    const profile = (await res.json()) as CustomerProfile;
    onAuthenticated(profile);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    try {
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
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

    if (data.session) {
      await fetch("/api/customer/profile", { method: "POST" });
      try {
        await loadProfile();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Account setup failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    setMessage(
      "We sent a verification link to your email. Open it, then sign in here to continue."
    );
    setMode("signin");
    setLoading(false);
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
