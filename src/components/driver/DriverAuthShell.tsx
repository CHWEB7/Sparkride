"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeroAmbientBackground } from "@/components/HeroAmbientBackground";

export {
  authInputClass,
  authLabelClass,
} from "@/components/customer/CustomerAuthShell";

type DriverAuthMode = "login" | "enroll";

type DriverAuthShellProps = {
  mode: DriverAuthMode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const HERO_COPY: Record<DriverAuthMode, { headline: string; subline: string }> = {
  login: {
    headline: "Driver portal",
    subline:
      "Sign in with your passkey to view assigned bookings, confirm trips, and keep customers updated.",
  },
  enroll: {
    headline: "Set up your driver passkey",
    subline:
      "Register once on this device for secure, passwordless access to the Sparkride driver portal.",
  },
};

function DriverAuthTabs({ mode }: { mode: DriverAuthMode }) {
  return (
    <div
      className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#e8eaee] mb-7"
      role="tablist"
      aria-label="Driver access"
    >
      <Link
        href="/driver/login"
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
      <Link
        href="/driver/enroll"
        role="tab"
        aria-selected={mode === "enroll"}
        className={`text-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
          mode === "enroll"
            ? "bg-white text-dark shadow-sm ring-1 ring-black/5"
            : "text-muted hover:text-dark"
        }`}
      >
        Set up passkey
      </Link>
    </div>
  );
}

export function DriverAuthShell({
  mode,
  title,
  subtitle,
  children,
}: DriverAuthShellProps) {
  const hero = HERO_COPY[mode];
  const alternateHref = mode === "login" ? "/driver/enroll" : "/driver/login";
  const alternateLabel =
    mode === "login" ? "First time on this device?" : "Already registered?";
  const alternateAction = mode === "login" ? "Set up passkey" : "Sign in with passkey";

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
        <header className="px-4 sm:px-8 pt-6">
          <Logo href="/" light size="header" />
        </header>

        <div className="flex-1 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-center px-4 sm:px-8 pb-10 lg:pb-12 pt-8 lg:pt-4">
          <div className="hidden lg:flex lg:justify-end text-white pr-2 xl:pr-4">
            <div className="max-w-md xl:max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-end mb-4">
                Sparkride drivers
              </p>
              <h1 className="text-4xl xl:text-5xl font-semibold leading-[1.08] tracking-[-0.03em]">
                {hero.headline}
              </h1>
              <p className="mt-5 text-lg text-white/75 leading-relaxed">{hero.subline}</p>
            </div>
          </div>

          <div className="w-full max-w-[440px] mx-auto lg:mx-0 lg:max-w-none">
            <div className="lg:hidden mb-6 text-white text-center px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-end mb-2">
                Sparkride drivers
              </p>
              <h1 className="text-2xl font-semibold tracking-[-0.02em]">{hero.headline}</h1>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{hero.subline}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] p-6 sm:p-8">
              <DriverAuthTabs mode={mode} />

              <h2 className="text-2xl font-semibold text-dark tracking-[-0.02em]">{title}</h2>
              {subtitle && (
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{subtitle}</p>
              )}

              <div className="mt-6">{children}</div>

              <div className="mt-6 pt-5 border-t border-black/8 text-center">
                <p className="text-sm text-muted">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
