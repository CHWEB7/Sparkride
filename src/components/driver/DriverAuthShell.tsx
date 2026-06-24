"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeroAmbientBackground } from "@/components/HeroAmbientBackground";

export {
  authInputClass,
  authLabelClass,
} from "@/components/customer/CustomerAuthShell";

export const driverAuthInputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none transition-shadow focus:border-brand/40 focus:ring-2 focus:ring-brand/20";

export const driverAuthButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export const driverAuthChipClass =
  "rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600";

type DriverAuthMode = "login" | "enroll";

type DriverAuthShellProps = {
  mode: DriverAuthMode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const HERO_COPY: Record<DriverAuthMode, { headline: string; subline: string }> = {
  login: {
    headline: "Your driver command centre",
    subline:
      "Manage bookings, confirm trips, and track performance — built for professional Sparkride drivers.",
  },
  enroll: {
    headline: "Welcome to Sparkride",
    subline:
      "Set up your authenticator and password to secure your driver account before your first trip.",
  },
};

function BrandPanel({ mode }: { mode: DriverAuthMode }) {
  const hero = HERO_COPY[mode];
  return (
    <div className="relative hidden min-h-screen overflow-hidden bg-[#141820] lg:flex lg:flex-col lg:items-center lg:justify-center">
      <HeroAmbientBackground forceDark />
      <div className="relative z-10 flex max-w-md flex-col items-center px-10 text-center">
        <Logo href="/" light size="xl" />
        <h1 className="mt-10 text-3xl font-semibold leading-tight tracking-[-0.03em] text-white xl:text-4xl">
          {hero.headline}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/70">{hero.subline}</p>
        <p className="mt-10 text-sm text-white/45">sparkride.co.uk</p>
      </div>
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
    mode === "login" ? "First time logging in?" : "Already set up your account?";
  const alternateAction = mode === "login" ? "First time login" : "Sign in";

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <BrandPanel mode={mode} />

      <div className="flex min-h-screen flex-col bg-white">
        <div className="relative overflow-hidden bg-[#141820] px-6 py-10 lg:hidden">
          <HeroAmbientBackground forceDark />
          <div className="relative z-10 flex flex-col items-center text-center">
            <Logo href="/" light size="lg" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{hero.subline}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10 pt-8 lg:px-12 lg:pb-16 lg:pt-10">
          <div className="w-full max-w-[420px]">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{subtitle}</p>
            )}

            <div className="mt-8">{children}</div>

            <div className="mt-8 text-center text-sm text-gray-500">
              {alternateLabel}{" "}
              <Link
                href={alternateHref}
                className="inline-flex items-center gap-0.5 font-semibold text-brand hover:text-brand-start transition-colors"
              >
                {alternateAction}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
