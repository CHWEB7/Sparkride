"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  Bookmark,
  CalendarClock,
  History,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CustomerProfile } from "@/lib/customer";
import { BookingForm } from "@/components/BookingForm";
import { BookingTripPaymentActions } from "@/components/booking/BookingTripPaymentActions";
import type { PaymentStatus } from "@prisma/client";

type PortalView = "home" | "wizard" | "active" | "history" | "saved";

type BookingRow = {
  id: string;
  reference: string;
  status: string;
  pickupDate: string;
  pickupAddress: string;
  dropoffAddress: string;
  paymentStatus: PaymentStatus;
  squarePaymentLinkUrl?: string | null;
  amountDue?: number | null;
  estimatedPrice?: number | null;
};

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
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [wizardTemplate, setWizardTemplate] = useState<SavedTemplate | null>(null);

  useEffect(() => {
    if (view !== "active" && view !== "history") return;
    setLoadingTrips(true);
    fetch("/api/customer/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoadingTrips(false));
  }, [view]);

  const activeStatuses = new Set(["PENDING", "CONFIRMED", "EN_ROUTE"]);
  const activeTrips = bookings.filter((b) => activeStatuses.has(b.status));
  const pastTrips = bookings.filter((b) => !activeStatuses.has(b.status));

  function startBooking(template?: SavedTemplate) {
    setWizardTemplate(template ?? null);
    setView("wizard");
  }

  if (view === "wizard") {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setWizardTemplate(null);
            setView("home");
          }}
          className="mb-6 text-sm font-medium text-brand hover:underline"
        >
          ← Back to customer portal
        </button>
        <BookingForm profile={profile} savedTemplate={wizardTemplate} />
      </div>
    );
  }

  if (view === "saved") {
    return (
      <div>
        <PortalNav title="Saved trip details" onBack={() => setView("home")} />
        <SavedDetailsManager
          onUseTemplate={(t) => startBooking(t)}
          onBack={() => setView("home")}
        />
      </div>
    );
  }

  if (view === "active" || view === "history") {
    const trips = view === "active" ? activeTrips : pastTrips;
    return (
      <div>
        <PortalNav
          title={view === "active" ? "Manage existing trips" : "Previous trips"}
          onBack={() => setView("home")}
        />
        <TripList trips={trips} loading={loadingTrips} emptyMessage={
          view === "active"
            ? "No upcoming trips. Book a new ride to get started."
            : "No previous trips yet."
        } />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand mb-2">
          Customer portal
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] dark:text-white">
          Welcome back{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-muted max-w-xl">
          Book new airport transfers, manage upcoming trips, and reuse saved journey details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-3 gap-4 lg:gap-4 lg:min-h-[420px]">
        <BookHeroTile onClick={() => startBooking()} />
        <PortalCompactCard
          icon={CalendarClock}
          title="Manage existing trips"
          desc="Track upcoming bookings"
          onClick={() => setView("active")}
          accent="sky"
        />
        <PortalCompactCard
          icon={History}
          title="Previous trips"
          desc="Completed & cancelled"
          onClick={() => setView("history")}
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
        ← Customer portal
      </button>
      <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-[-0.02em] dark:text-white">
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
      className="relative min-h-[300px] sm:min-h-[340px] lg:min-h-0 lg:row-span-3 rounded-3xl overflow-hidden text-left group shadow-md hover:shadow-xl transition-shadow"
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
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
          New booking
        </p>
        <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.02em]">
          Book a new ride
        </h3>
        <p className="mt-2 text-sm text-white/80 max-w-sm leading-relaxed">
          Start a fresh airport transfer with live pricing and driver choice.
        </p>
        <span className="mt-5 inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-full bg-white text-dark text-sm font-semibold group-hover:gap-3 transition-all">
          Get started
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </button>
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
      className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-booking-bg dark:bg-dark-elevated hover:shadow-md transition-all group text-left lg:min-h-0"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold dark:text-white">{title}</h3>
        <p className="text-sm text-muted mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted group-hover:text-brand shrink-0 transition-colors" />
    </button>
  );
}

function TripList({
  trips,
  loading,
  emptyMessage,
}: {
  trips: BookingRow[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-16 text-muted">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="rounded-2xl bg-booking-bg dark:bg-dark-elevated p-8 text-center text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {trips.map((booking) => (
        <li key={booking.id}>
          <Link
            href={`/booking/${booking.reference}`}
            className="block rounded-2xl bg-booking-bg dark:bg-dark-elevated p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold dark:text-white">{booking.reference}</p>
                <p className="text-sm text-muted mt-1">
                  {format(new Date(booking.pickupDate), "EEE d MMM yyyy · HH:mm")}
                </p>
                <p className="text-sm text-muted mt-1">
                  {booking.pickupAddress} → {booking.dropoffAddress}
                </p>
                <BookingTripPaymentActions
                  reference={booking.reference}
                  status={booking.status}
                  paymentStatus={booking.paymentStatus}
                  squarePaymentLinkUrl={booking.squarePaymentLinkUrl}
                  amountDue={booking.amountDue}
                  estimatedPrice={booking.estimatedPrice}
                />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-light dark:bg-brand/10 text-brand">
                {booking.status.replace(/_/g, " ")}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
