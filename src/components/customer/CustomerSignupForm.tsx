"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/site-url";
import {
  CustomerAuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/customer/CustomerAuthShell";

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: phone.trim()
            ? `+44${phone.replace(/\s/g, "").replace(/^0/, "")}`
            : phone,
        },
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

  if (verificationSent) {
    return (
      <CustomerAuthShell
        mode="signup"
        redirect={redirect}
        title="Check your email"
        subtitle="One more step before you can book"
        hideTabs
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-brand" />
          </div>
          <p className="text-dark font-medium leading-relaxed">
            We&apos;ve sent a verification link to
          </p>
          <p className="mt-2 text-brand font-semibold break-all">{submittedEmail}</p>
          <p className="mt-4 text-sm text-muted leading-relaxed">
            Open the email and click the link to verify your account. Once verified,
            sign in to book your transfer.
          </p>
          <Link
            href={loginHref}
            className="mt-8 inline-flex w-full items-center justify-center py-3.5 bg-brand-gradient hover:opacity-90 text-white font-semibold rounded-xl transition-opacity"
          >
            Sign in
          </Link>
          <p className="mt-4 text-xs text-muted">
            Didn&apos;t receive it? Check your spam folder or try signing up again with
            the same email.
          </p>
        </div>
      </CustomerAuthShell>
    );
  }

  return (
    <CustomerAuthShell
      mode="signup"
      redirect={redirect}
      title="Create your account"
      subtitle="Required to book airport transfers"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className={authLabelClass}>Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className={authInputClass}
          />
        </div>

        <div>
          <label className={authLabelClass}>Phone number</label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-3.5 rounded-xl bg-[#f0f1f3] text-sm font-medium text-dark/70 shrink-0">
              <span aria-hidden>🇬🇧</span>
              <span>+44</span>
            </div>
            <input
              type="tel"
              required
              placeholder="7xxx xxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${authInputClass} flex-1 min-w-0`}
            />
          </div>
        </div>

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
          <label className={authLabelClass}>Password</label>
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

        <label className="flex items-start gap-3 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-black/20 text-brand focus:ring-brand/40"
          />
          <span className="text-xs text-muted leading-relaxed">
            I agree to Sparkride&apos;s{" "}
            <Link href="/terms" className="text-brand font-medium hover:underline">
              Terms &amp; conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand font-medium hover:underline">
              Privacy policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Sending..." : "Create account"}
        </button>
      </form>
    </CustomerAuthShell>
  );
}
