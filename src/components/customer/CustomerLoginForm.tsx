"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/site-url";
import {
  CustomerAuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/customer/CustomerAuthShell";
import { CustomerEmailVerifyPanel } from "@/components/customer/CustomerEmailVerifyPanel";

type Step = "credentials" | "verify";

export function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/book";
  const sessionExpired = searchParams.get("error") === "session_expired";
  const verifyRequired = searchParams.get("verify") === "required";

  const [step, setStep] = useState<Step>(verifyRequired ? "verify" : "credentials");
  const [bootstrapping, setBootstrapping] = useState(verifyRequired);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function prepareVerifyStep() {
      setBootstrapping(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
          if (verifyRequired) setStep("credentials");
          return;
        }

        const statusRes = await fetch("/api/auth/mfa/status");
        if (statusRes.ok) {
          const data = (await statusRes.json()) as { verified?: boolean };
          if (data.verified) {
            if (verifyRequired) {
              router.replace(redirect);
              router.refresh();
            }
            return;
          }
        }

        setEmail(user.email);
        setStep("verify");
      } catch {
        if (verifyRequired) setStep("credentials");
      } finally {
        setBootstrapping(false);
      }
    }

    if (verifyRequired) {
      prepareVerifyStep();
    }
  }, [verifyRequired, redirect, router]);

  async function continueAfterAuth(userEmail: string) {
    try {
      const statusRes = await fetch("/api/auth/mfa/status");
      if (statusRes.ok) {
        const data = (await statusRes.json()) as { verified?: boolean };
        if (data.verified) {
          router.push(redirect);
          router.refresh();
          return;
        }
      }

      setEmail(userEmail);
      setStep("verify");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
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

  function handleVerified() {
    router.push(redirect);
    router.refresh();
  }

  return (
    <CustomerAuthShell
      mode="login"
      redirect={redirect}
      hideTabs={step === "verify"}
      title={step === "credentials" ? "Sign in" : "Verify your email"}
      subtitle={
        step === "credentials"
          ? "Access your bookings and reserve your next ride"
          : "Enter the one-time code we send to your inbox"
      }
    >
      {bootstrapping ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-7 h-7 text-brand animate-spin" />
        </div>
      ) : step === "credentials" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {sessionExpired && (
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-800 text-sm">
              Your session ended at midnight. Please sign in again.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
          )}
          {message && (
            <div className="p-3 rounded-xl bg-brand-light text-brand text-sm">{message}</div>
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
      ) : (
        <CustomerEmailVerifyPanel
          email={email}
          redirect={redirect}
          onVerified={handleVerified}
          onBack={() => {
            setStep("credentials");
            setError("");
          }}
        />
      )}
    </CustomerAuthShell>
  );
}
