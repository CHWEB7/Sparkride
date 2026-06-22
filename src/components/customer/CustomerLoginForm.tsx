"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/site-url";
import {
  CustomerAuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/customer/CustomerAuthShell";

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
    <CustomerAuthShell
      mode="login"
      redirect={redirect}
      title="Sign in"
      subtitle="Access your bookings and reserve your next ride"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {sessionExpired && (
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-800 text-sm">
            Your session ended at midnight. Please sign in again.
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 rounded-xl bg-brand-light text-brand text-sm">
            {message}
          </div>
        )}

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
          <div className="flex items-center justify-between mb-2">
            <label className={authLabelClass + " mb-0"}>Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-medium text-brand hover:underline"
            >
              Forgot password?
            </button>
          </div>
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
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </CustomerAuthShell>
  );
}
