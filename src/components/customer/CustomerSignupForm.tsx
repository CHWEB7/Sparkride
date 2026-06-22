"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { getAuthCallbackUrl } from "@/lib/site-url";

export function CustomerSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/book";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: getAuthCallbackUrl(redirect),
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await fetch("/api/customer/profile", { method: "POST" });
      router.push(redirect);
      router.refresh();
      return;
    }

    setSubmittedEmail(email.trim());
    setVerificationSent(true);
    setLoading(false);
  }

  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`;

  return (
    <div className="min-h-screen bg-app-bg dark:bg-dark flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo href="/" />
          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em] dark:text-white">
            {verificationSent ? "Check your email" : "Create account"}
          </h1>
          <p className="mt-2 text-muted text-sm">
            {verificationSent
              ? "One more step before you can book"
              : "An account is required to book airport transfers"}
          </p>
        </div>

        {verificationSent ? (
          <div className="bg-booking-bg dark:bg-dark-elevated rounded-2xl p-8 shadow-md text-center">
            <div className="w-14 h-14 rounded-full bg-brand-light dark:bg-brand/10 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-brand" />
            </div>
            <p className="text-dark dark:text-white font-medium leading-relaxed">
              We&apos;ve sent a verification link to
            </p>
            <p className="mt-2 text-brand font-semibold break-all">{submittedEmail}</p>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              Open the email and click the link to verify your account. Once verified,
              sign in to book your transfer.
            </p>
            <Link
              href={loginHref}
              className="mt-8 inline-flex w-full items-center justify-center py-3 bg-brand-gradient hover:opacity-90 text-white font-semibold rounded-xl transition-opacity"
            >
              Sign in
            </Link>
            <p className="mt-4 text-xs text-muted">
              Didn&apos;t receive it? Check your spam folder or try signing up again with
              the same email.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-booking-bg dark:bg-dark-elevated rounded-2xl p-8 space-y-5 shadow-md"
          >
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark dark:text-white focus:border-brand outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Phone</label>
              <input
                type="tel"
                required
                placeholder="07xxx xxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark dark:text-white focus:border-brand outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark dark:text-white focus:border-brand outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark dark:text-white focus:border-brand outline-none text-sm"
              />
              <p className="mt-1 text-xs text-muted">At least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Sending..." : "Send verification email"}
            </button>
          </form>
        )}

        {!verificationSent && (
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href={loginHref} className="text-brand-start font-medium hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
