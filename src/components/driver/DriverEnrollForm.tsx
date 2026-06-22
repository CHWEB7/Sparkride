"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fingerprint, KeyRound, Loader2, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = "bootstrap" | "passkey";

export function DriverEnrollForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("bootstrap");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.app_metadata?.role === "driver") {
        const { data: passkeys } = await supabase.auth.passkey.list();
        if ((passkeys?.length ?? 0) > 0) {
          router.replace("/driver/dashboard");
          return;
        }
        setStep("passkey");
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      if (data.user?.app_metadata?.role !== "driver") {
        await supabase.auth.signOut();
        throw new Error("This account is not authorised for the driver portal.");
      }

      setStep("passkey");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterPasskey() {
    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: registerError } = await supabase.auth.registerPasskey();

      if (registerError) throw registerError;

      router.push("/driver/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Passkey registration failed. Use the same device you will drive with."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-end animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Sparkride</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">
            {step === "bootstrap" ? "Driver passkey setup" : "Register your passkey"}
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            {step === "bootstrap"
              ? "Sign in once with your one-time password, then register a passkey."
              : "Create a passkey on this device. You will use it for all future sign-ins."}
          </p>
        </div>

        <div className="bg-dark-elevated rounded-2xl p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
          )}

          {step === "bootstrap" ? (
            <form onSubmit={handleBootstrap} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  One-time password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand outline-none text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Provided by Sparkride when your driver account was created. Used only for this
                  one-time setup.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-brand-gradient disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Continue
                  </>
                )}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={handleRegisterPasskey}
              disabled={submitting}
              className="w-full py-3.5 bg-brand-gradient disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Register passkey
                </>
              )}
            </button>
          )}

          <p className="text-center text-sm text-gray-400">
            Already registered?{" "}
            <Link href="/driver/login" className="text-brand-end hover:underline">
              Sign in with passkey
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
