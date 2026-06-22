"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  Bookmark,
  CalendarClock,
  History,
  Loader2,
  Plus,
} from "lucide-react";
import type { CustomerProfile } from "@/lib/customer";
import { BookingForm } from "@/components/BookingForm";
import { SavedDetailsManager } from "@/components/customer/SavedDetailsManager";

type PortalView = "home" | "wizard" | "active" | "history" | "saved";

type BookingRow = {
  id: string;
  reference: string;
  status: string;
  pickupDate: string;
  pickupAddress: string;
  dropoffAddress: string;
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

      <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
        <PortalCard
          icon={Plus}
          title="Book a new ride"
          desc="Start a fresh booking with live pricing"
          onClick={() => startBooking()}
          accent="brand"
        />
        <PortalCard
          icon={CalendarClock}
          title="Manage existing trips"
          desc="View and track upcoming bookings"
          onClick={() => setView("active")}
          accent="sky"
        />
        <PortalCard
          icon={History}
          title="Previous trips"
          desc="Browse completed and cancelled journeys"
          onClick={() => setView("history")}
          accent="violet"
        />
        <PortalCard
          icon={Bookmark}
          title="Saved trip details"
          desc="Edit, delete, or reuse saved routes"
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

function PortalCard({
  icon: Icon,
  title,
  desc,
  onClick,
  accent,
}: {
  icon: typeof Plus;
  title: string;
  desc: string;
  onClick: () => void;
  accent: "brand" | "sky" | "violet" | "emerald";
}) {
  const accents = {
    brand: "bg-brand/15 text-brand",
    sky: "bg-sky-500/15 text-sky-600",
    violet: "bg-violet-500/15 text-violet-600",
    emerald: "bg-emerald-500/15 text-emerald-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-6 sm:p-7 rounded-2xl bg-booking-bg dark:bg-dark-elevated hover:shadow-md transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accents[accent]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-muted leading-relaxed">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all">
        Open
        <ArrowRight className="w-4 h-4" />
      </span>
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
