"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeroAmbientBackground } from "@/components/HeroAmbientBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export const authInputClass =
  "w-full px-4 py-3.5 rounded-xl bg-[#f0f1f3] text-dark placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/35 text-[15px]";

export const authLabelClass = "block text-sm font-medium text-dark/80 mb-2";

type AuthMode = "signup" | "login";

type CustomerAuthShellProps = {
  mode: AuthMode;
  redirect: string;
  title: string;
  subtitle?: string;
  hideTabs?: boolean;
  children: React.ReactNode;
};

const HERO_COPY: Record<AuthMode, { headline: string; subline: string }> = {
  signup: {
    headline: "Book premium airport transfers with Sparkride",
    subline:
      "Create an account to reserve rides, track bookings, and travel with confidence across Yorkshire and the UK.",
  },
  login: {
    headline: "Welcome back to Sparkride",
    subline:
      "Sign in to manage your bookings, view trip details, and reserve your next airport transfer.",
  },
};

function AuthModeTabs({
  mode,
  redirect,
}: {
  mode: AuthMode;
  redirect: string;
}) {
  const signupHref = `/signup?redirect=${encodeURIComponent(redirect)}`;
  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`;

  return (
    <div
      className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#e8eaee] mb-7"
      role="tablist"
      aria-label="Account type"
    >
      <Link
        href={signupHref}
        role="tab"
        aria-selected={mode === "signup"}
        className={`text-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
          mode === "signup"
            ? "bg-white text-dark shadow-sm ring-1 ring-black/5"
            : "text-muted hover:text-dark"
        }`}
      >
        Sign up
      </Link>
      <Link
        href={loginHref}
        role="tab"
        aria-selected={mode === "login"}
        className={`text-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
          mode === "login"
            ? "bg-white text-dark shadow-sm ring-1 ring-black/5"
            : "text-muted hover:text-dark"
        }`}
      >
        Sign in
      </Link>
    </div>
  );
}

export function CustomerAuthShell({
  mode,
  redirect,
  title,
  subtitle,
  hideTabs = false,
  children,
}: CustomerAuthShellProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const hero = HERO_COPY[mode];
  const alternateHref =
    mode === "signup"
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : `/signup?redirect=${encodeURIComponent(redirect)}`;
  const alternateLabel =
    mode === "signup" ? "Already have an account?" : "New to Sparkride?";
  const alternateAction = mode === "signup" ? "Sign in" : "Create account";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#12151c]">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=2000&q=80')",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#0d1018]/78" aria-hidden />
      <div className="absolute inset-0 opacity-40" aria-hidden>
        <HeroAmbientBackground />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-4 sm:px-8 pt-6 flex items-center justify-between">
          <Logo href="/" light size="header" />
          <ThemeToggle light />
        </header>

        <div className="flex-1 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-center px-4 sm:px-8 pb-10 lg:pb-12 pt-8 lg:pt-4">
          <div className="hidden lg:flex lg:justify-end text-white pr-2 xl:pr-4">
            <div className="max-w-md xl:max-w-lg">
              <h1 className="text-4xl xl:text-5xl font-semibold leading-[1.08] tracking-[-0.03em]">
                {hero.headline}
              </h1>
              <p className="mt-5 text-lg text-white/75 leading-relaxed">
                {hero.subline}
              </p>
            </div>
          </div>

          <div className="w-full max-w-[440px] mx-auto lg:mx-0 lg:max-w-none">
            <div className="lg:hidden mb-6 text-white text-center px-2">
              <h1 className="text-2xl font-semibold tracking-[-0.02em]">
                {hero.headline}
              </h1>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                {hero.subline}
              </p>
            </div>

            <div
              className={`rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] p-6 sm:p-8 ${
                isLight ? "bg-white" : "bg-dark-elevated border border-white/10"
              }`}
            >
              {!hideTabs && <AuthModeTabs mode={mode} redirect={redirect} />}

              <h2
                className={`text-2xl font-semibold tracking-[-0.02em] ${
                  isLight ? "text-dark" : "text-white"
                }`}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className={`mt-1.5 text-sm leading-relaxed ${
                    isLight ? "text-muted" : "text-gray-400"
                  }`}
                >
                  {subtitle}
                </p>
              )}

              <div className="mt-6">{children}</div>

              {!hideTabs && (
                <div
                  className={`mt-6 pt-5 border-t text-center ${
                    isLight ? "border-black/8" : "border-white/10"
                  }`}
                >
                  <p className={`text-sm ${isLight ? "text-muted" : "text-gray-400"}`}>
                    {alternateLabel}{" "}
                    <Link
                      href={alternateHref}
                      className="inline-flex items-center gap-0.5 font-semibold text-brand hover:text-brand-start transition-colors"
                    >
                      {alternateAction}
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
