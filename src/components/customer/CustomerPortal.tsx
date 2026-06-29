"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CalendarClock,
  History,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CustomerProfile } from "@/lib/customer";
import { BookingForm } from "@/components/BookingForm";
import { SavedDetailsManager } from "@/components/customer/SavedDetailsManager";

type PortalView = "home" | "wizard" | "saved";

type SavedTemplate = {
  id: string;
  label: string;
  serviceType: string;
  journeyType: string;
  tripType: string;
  airportCode: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  passengers: number;
  luggage: number;
  vehicleType: string;
  driverId: string | null;
  notes: string | null;
};

export function CustomerPortal({ profile }: { profile: CustomerProfile }) {
  const [view, setView] = useState<PortalView>("home");
  const [wizardTemplate, setWizardTemplate] = useState<SavedTemplate | null>(null);

  function startBooking(template?: SavedTemplate) {
    setWizardTemplate(template ?? null);
    setView("wizard");
  }

  if (view === "wizard") {
    return (
      <div className="pt-8">
        <Link
          href="/book"
          className="mb-6 inline-block text-sm font-medium text-brand hover:underline"
        >
          ← Back to portal hub
        </Link>
        <BookingForm profile={profile} savedTemplate={wizardTemplate} />
      </div>
    );
  }

  if (view === "saved") {
    return (
      <div className="pt-8">
        <PortalNav title="Saved trip details" onBack={() => setView("home")} />
        <SavedDetailsManager
          onUseTemplate={(t) => startBooking(t)}
          onBack={() => setView("home")}
        />
      </div>
    );
  }

  return (
    <div className="pt-8">
      <div className="mb-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">
          Customer portal
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl dark:text-white">
          Welcome back{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Book new airport transfers, manage upcoming trips, and reuse saved journey details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-3 lg:gap-4 lg:min-h-[420px]">
        <BookHeroTile onClick={() => startBooking()} />
        <PortalCompactLink
          href="/my-bookings"
          icon={CalendarClock}
          title="Manage existing trips"
          desc="Track upcoming bookings"
          accent="sky"
        />
        <PortalCompactLink
          href="/my-bookings?filter=past"
          icon={History}
          title="Previous trips"
          desc="Completed & cancelled"
          accent="violet"
        />
        <PortalCompactCard
          icon={Bookmark}
          title="Saved trip details"
          desc="Reuse saved routes"
          onClick={() => setView("saved")}
          accent="emerald"
        />
      </div>
    </div>
  );
}

function PortalNav({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-brand hover:underline"
      >
        ← Portal hub
      </button>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl dark:text-white">
        {title}
      </h2>
    </div>
  );
}

function BookHeroTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[300px] overflow-hidden rounded-3xl text-left shadow-md transition-shadow hover:shadow-xl sm:min-h-[340px] lg:row-span-3 lg:min-h-0"
    >
      <Image
        src="/images/portal-book-ride.jpg"
        alt=""
        fill
        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 1024px) 100vw, 55vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
          New booking
        </p>
        <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
          Book a new ride
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
          Start a fresh airport transfer with live pricing and driver choice.
        </p>
        <span className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-dark transition-all group-hover:gap-3">
          Get started
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

function PortalCompactLink({
  href,
  icon: Icon,
  title,
  desc,
  accent,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: "sky" | "violet" | "emerald";
}) {
  const accents = {
    sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl bg-booking-bg p-5 text-left transition-all hover:shadow-md dark:bg-dark-elevated sm:p-6 lg:min-h-0"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold dark:text-white">{title}</h3>
        <p className="mt-0.5 truncate text-sm text-muted">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-brand" />
    </Link>
  );
}

function PortalCompactCard({
  icon: Icon,
  title,
  desc,
  onClick,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  onClick: () => void;
  accent: "sky" | "violet" | "emerald";
}) {
  const accents = {
    sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl bg-booking-bg p-5 text-left transition-all hover:shadow-md dark:bg-dark-elevated sm:p-6 lg:min-h-0"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold dark:text-white">{title}</h3>
        <p className="mt-0.5 truncate text-sm text-muted">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-brand" />
    </button>
  );
}
