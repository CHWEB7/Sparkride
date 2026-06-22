"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { getAuthCallbackUrl } from "@/lib/site-url";

export function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/book";
  const sessionExpired = searchParams.get("error") === "session_expired";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

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
      redirectTo: getAuthCallbackUrl("/account"),
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Password reset email sent — check your inbox.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-app-bg dark:bg-dark flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo href="/" />
          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em] dark:text-white">
            Sign in
          </h1>
          <p className="mt-2 text-muted text-sm">
            Sign in to book and manage your transfers
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-booking-bg dark:bg-dark-elevated rounded-2xl p-8 space-y-5 shadow-md"
        >
          {sessionExpired && (
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm">
              Your session ended at midnight. Please sign in again.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 rounded-xl bg-brand-light dark:bg-brand/10 text-brand text-sm">
              {message}
            </div>
          )}

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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-muted">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-brand-start hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark dark:text-white focus:border-brand outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          No account?{" "}
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirect)}`}
            className="text-brand-start font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
