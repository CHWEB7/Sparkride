"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import {
  CustomerAuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/customer/CustomerAuthShell";

const OTP_SESSION_KEY = "sparkride_otp_requested";

type SendCodeResult = {
  ok?: boolean;
  sent?: boolean;
  skipped?: boolean;
  resendIn?: number;
  error?: string;
  message?: string;
};

type CustomerEmailVerifyPanelProps = {
  email: string;
  redirect: string;
  onVerified: () => void;
  onBack?: () => void;
};

export function CustomerEmailVerifyPanel({
  email,
  redirect,
  onVerified,
  onBack,
}: CustomerEmailVerifyPanelProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const sendCode = useCallback(async () => {
    if (!email) return;
    setSending(true);
    setError("");
    setInfo("");

    const res = await fetch("/api/auth/mfa/send", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as SendCodeResult;

    setSending(false);

    if (data.skipped) {
      setResendIn(data.resendIn ?? 120);
      setInfo(data.message || "Please wait before requesting another code.");
      setCodeSent(true);
      return;
    }

    if (!res.ok) {
      setError(data.error || "Failed to send verification code");
      if (data.resendIn) setResendIn(data.resendIn);
      return;
    }

    if (!data.sent) {
      setError("Verification code could not be sent. Try again in a moment.");
      return;
    }

    setCodeSent(true);
    setResendIn(data.resendIn ?? 120);
    sessionStorage.setItem(OTP_SESSION_KEY, String(Date.now()));
    setInfo("Verification code sent — check your inbox and spam folder.");
  }, [email]);

  useEffect(() => {
    const lastRequested = sessionStorage.getItem(OTP_SESSION_KEY);
    if (lastRequested) {
      const elapsed = (Date.now() - Number(lastRequested)) / 1000;
      if (elapsed < 120) {
        setCodeSent(true);
        setResendIn(Math.ceil(120 - elapsed));
      }
    }
  }, []);

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

    const res = await fetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || "Invalid verification code");
      setLoading(false);
      return;
    }

    sessionStorage.removeItem(OTP_SESSION_KEY);
    onVerified();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-light text-sm text-brand">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <span>
          For your security, we verify your email once per day. Your session ends at midnight.
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
      )}
      {info && (
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-800 text-sm">{info}</div>
      )}

      <p className="text-sm text-muted text-center">
        {codeSent ? "Code sent to" : "Code will be sent to"}{" "}
        <span className="font-medium text-dark">{email}</span>
      </p>

      {!codeSent ? (
        <button
          type="button"
          onClick={sendCode}
          disabled={sending || !email}
          className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          {sending ? "Sending..." : "Send verification code"}
        </button>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className={authLabelClass}>Verification code</label>
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
              className={`${authInputClass} text-center text-lg tracking-[0.3em] font-mono`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Verify and continue
          </button>

          <button
            type="button"
            onClick={sendCode}
            disabled={sending || resendIn > 0}
            className="w-full text-sm font-medium text-brand hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {sending
              ? "Sending..."
              : resendIn > 0
                ? `Resend code in ${resendIn}s`
                : "Resend code"}
          </button>
        </form>
      )}

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm font-medium text-muted hover:text-dark transition-colors"
        >
          Back to sign in
        </button>
      )}
    </div>
  );
}
