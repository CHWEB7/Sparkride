"use client";

import { useEffect, useState } from "react";
import { Loader2, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authInputClass, authLabelClass } from "@/components/driver/DriverAuthShell";

type DriverTotpSetupProps = {
  onComplete: () => void;
};

export function DriverTotpSetup({ onComplete }: DriverTotpSetupProps) {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function startEnrollment() {
      setLoading(true);
      setError("");

      try {
        const supabase = createClient();
        const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
        if (listError) throw listError;

        const verified = factors?.totp?.find((factor) => factor.status === "verified");
        if (verified) {
          onComplete();
          return;
        }

        const pending = factors?.all?.find(
          (factor) => factor.factor_type === "totp" && factor.status !== "verified"
        );
        if (pending) {
          const { error: unenrollError } = await supabase.auth.mfa.unenroll({
            factorId: pending.id,
          });
          if (unenrollError) throw unenrollError;
        }

        const { data, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Sparkride Driver",
          issuer: "Sparkride Driver",
        });
        if (enrollError) throw enrollError;
        if (!data?.id || !data.totp) {
          throw new Error("Could not start authenticator setup.");
        }

        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not start authenticator setup. Try again."
        );
      } finally {
        setLoading(false);
      }
    }

    startEnrollment();
  }, [onComplete]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;

    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;

      onComplete();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid code. Check your authenticator app and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-7 h-7 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
      )}

      <div className="rounded-xl border border-black/8 bg-[#f9fafc] p-4 text-center">
        {qrCode ? (
          <img
            src={qrCode}
            alt="QR code for authenticator app"
            className="mx-auto h-44 w-44 rounded-lg bg-white p-2"
          />
        ) : (
          <div className="flex h-44 items-center justify-center text-sm text-muted">
            QR code unavailable
          </div>
        )}
        <p className="mt-4 text-sm text-muted leading-relaxed">
          Scan this QR code with Google Authenticator, Microsoft Authenticator, Authy, or
          another TOTP app.
        </p>
        {secret && (
          <p className="mt-3 text-xs text-muted break-all">
            Manual key: <span className="font-mono text-dark">{secret}</span>
          </p>
        )}
      </div>

      <div>
        <label className={authLabelClass}>6-digit code from your app</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={authInputClass}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || code.length !== 6}
        className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Smartphone className="w-5 h-5" />
            Verify authenticator
          </>
        )}
      </button>
    </form>
  );
}
