"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

const RESEND_COOLDOWN_SEC = 60;

export function CustomerVerify2faForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/book";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const sendCode = useCallback(async () => {
    if (!email) return;
    setSending(true);
    setError("");

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    setSending(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }

    setCodeSent(true);
    setResendIn(RESEND_COOLDOWN_SEC);
  }, [email]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.email) {
        router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }
      setEmail(user.email);
    });
  }, [redirect, router]);

  useEffect(() => {
    if (!email || codeSent) return;
    void sendCode();
  }, [email, codeSent, sendCode]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || code.trim().length < 6) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    const completeRes = await fetch("/api/auth/mfa/complete", { method: "POST" });
    if (!completeRes.ok) {
      setError("Verification succeeded but session could not be saved. Try again.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-app-bg dark:bg-dark flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo href="/" />
          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em] dark:text-white">
            Verify your email
          </h1>
          <p className="mt-2 text-muted text-sm">
            Enter the 6-digit code we sent to complete sign-in
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="bg-booking-bg dark:bg-dark-elevated rounded-2xl p-8 space-y-5 shadow-md"
        >
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-light dark:bg-brand/10 text-sm text-brand">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>
              For your security, we verify your email once per day. Your session ends at
              midnight.
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {email && (
            <p className="text-sm text-muted text-center">
              Code sent to <span className="font-medium text-dark dark:text-white">{email}</span>
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark dark:text-white focus:border-brand outline-none text-sm text-center text-lg tracking-[0.3em] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-3 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Verify and continue
          </button>

          <button
            type="button"
            onClick={sendCode}
            disabled={sending || resendIn > 0}
            className="w-full text-sm text-brand-start hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {sending
              ? "Sending..."
              : resendIn > 0
                ? `Resend code in ${resendIn}s`
                : "Resend code"}
          </button>
        </form>
      </div>
    </div>
  );
}
