"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authInputClass, authLabelClass } from "@/components/driver/DriverAuthShell";

type DriverSetPasswordFormProps = {
  onComplete: () => void;
  submitLabel?: string;
};

export function DriverSetPasswordForm({
  onComplete,
  submitLabel = "Save password",
}: DriverSetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { driver_password_set: true },
      });

      if (updateError) throw updateError;

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
      )}

      <div>
        <label className={authLabelClass}>New password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInputClass}
        />
      </div>

      <div>
        <label className={authLabelClass}>Confirm password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={authInputClass}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-5 h-5" />
            {submitLabel}
          </>
        )}
      </button>
    </form>
  );
}
