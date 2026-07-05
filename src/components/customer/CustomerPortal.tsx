"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowRight,
  Loader2,
  MapPin,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CustomerProfile } from "@/lib/customer";
import { BookingForm } from "@/components/BookingForm";
import {
  CustomerBookingShell,
  type CustomerPortalView,
} from "@/components/customer/CustomerBookingShell";
import { SavedDetailsManager } from "@/components/customer/SavedDetailsManager";
import { AccountForm } from "@/components/customer/AccountForm";
import { BookingTripPaymentActions } from "@/components/booking/BookingTripPaymentActions";
import { formatBookingStatus } from "@/lib/booking-status";
import type { PaymentStatus } from "@prisma/client";

type PortalView = CustomerPortalView | "wizard";

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

type TripTab = "all" | "active" | "past";

const ACTIVE_STATUSES = new Set(["PENDING", "ACCEPTED", "CONFIRMED"]);

const VIEW_TITLES: Record<CustomerPortalView, string> = {
  home: "Overview",
  active: "Upcoming trips",
  history: "Past trips",
  saved: "Saved routes",
  account: "Account settings",
};

export function CustomerPortal({
  profile,
  initialWizardFromAi = false,
}: {
  profile: CustomerProfile | null;
  initialWizardFromAi?: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<PortalView>(initialWizardFromAi ? "wizard" : "home");
  const [fromAiWizard] = useState(initialWizardFromAi);
  const [tripTab, setTripTab] = useState<TripTab>("all");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [wizardTemplate, setWizardTemplate] = useState<SavedTemplate | null>(null);
  const [returnView, setReturnView] = useState<CustomerPortalView>("home");
  const [wizardKey, setWizardKey] = useState(0);

  const shellView: CustomerPortalView = view === "wizard" ? returnView : view;

  useEffect(() => {
    if (!profile) {
      setLoadingTrips(false);
      return;
    }

    setLoadingTrips(true);
    fetch("/api/customer/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoadingTrips(false));
  }, [profile]);

  const activeTrips = bookings
    .filter((b) => ACTIVE_STATUSES.has(b.status))
    .sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime());
  const pastTrips = bookings.filter((b) => !ACTIVE_STATUSES.has(b.status));

  const displayedTrips = useMemo(() => {
    let list = bookings;
    if (view === "active" || tripTab === "active") list = activeTrips;
    else if (view === "history" || tripTab === "past") list = pastTrips;

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (b) =>
        b.reference.toLowerCase().includes(q) ||
        b.pickupAddress.toLowerCase().includes(q) ||
        b.dropoffAddress.toLowerCase().includes(q)
    );
  }, [bookings, activeTrips, pastTrips, view, tripTab, search]);

  function startBooking(template?: SavedTemplate) {
    if (view !== "wizard") {
      setReturnView(view);
    }
    setWizardTemplate(template ?? null);
    setWizardKey((k) => k + 1);
    setView("wizard");
  }

  function closeWizard() {
    setWizardTemplate(null);
    setView(returnView);
    setLoadingTrips(true);
    fetch("/api/customer/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoadingTrips(false));
  }

  function navigate(viewId: CustomerPortalView) {
    if (view === "wizard") {
      setWizardTemplate(null);
      setView(viewId);
    } else {
      setView(viewId);
    }
    if (viewId === "home") setTripTab("all");
    else if (viewId === "active") setTripTab("active");
    else if (viewId === "history") setTripTab("past");
  }

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!profile && fromAiWizard) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-dark-elevated">
          <BookingForm variant="embedded" fromAi={fromAiWizard} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <CustomerBookingShell
      profile={profile}
      activeView={shellView}
      bookingActive={view === "wizard"}
      onNavigate={navigate}
      onNewBooking={() => startBooking()}
      onSignOut={signOut}
    >
      {view === "wizard" ? (
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-dark-elevated">
            <BookingForm
              key={wizardTemplate?.id ?? `new-${wizardKey}`}
              profile={profile}
              savedTemplate={wizardTemplate}
              variant="embedded"
              fromAi={fromAiWizard}
              onCancel={closeWizard}
            />
          </div>
        </div>
      ) : view === "saved" ? (
          <SavedDetailsManager
            onUseTemplate={(t) => startBooking(t)}
            onBack={() => setView("home")}
          />
        ) : view === "account" ? (
          <div className="mx-auto max-w-lg">
            <PageHeader title={VIEW_TITLES.account} subtitle="Update your contact details for bookings" />
            <div className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-dark-elevated">
              <AccountForm customer={profile} />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl">
            <PageHeader
              title={VIEW_TITLES[shellView]}
              subtitle={
                shellView === "home"
                  ? "Manage airport transfers, review trips, and start a new booking."
                  : shellView === "active"
                    ? "Trips that are pending, confirmed, or awaiting payment."
                    : "Completed and cancelled journeys."
              }
              action={
                <button
                  type="button"
                  onClick={() => startBooking()}
                  className="hidden items-center gap-2 rounded-xl border-2 border-brand px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white sm:inline-flex"
                >
                  <Plus className="h-4 w-4" />
                  New booking
                </button>
              }
            />

            {shellView === "home" && (
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard label="Upcoming" value={activeTrips.length} accent="brand" />
                <StatCard label="Past trips" value={pastTrips.length} accent="muted" />
                <StatCard
                  label="Next pickup"
                  value={
                    activeTrips[0]
                      ? format(new Date(activeTrips[0].pickupDate), "d MMM")
                      : "—"
                  }
                  accent="sky"
                  isText
                />
              </div>
            )}

            {(shellView === "home" || shellView === "active" || shellView === "history") && (
              <>
                {shellView === "home" && (
                  <TripTabs active={tripTab} onChange={setTripTab} counts={{
                    all: bookings.length,
                    active: activeTrips.length,
                    past: pastTrips.length,
                  }} />
                )}

                <div className="mb-5 mt-6">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by reference or address"
                      className="w-full rounded-2xl border border-gray-200/80 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10 dark:bg-dark-elevated dark:text-white"
                    />
                  </label>
                </div>

                <BookingCardList
                  trips={displayedTrips}
                  loading={loadingTrips}
                  emptyMessage={
                    search
                      ? "No bookings match your search."
                      : tripTab === "active" || shellView === "active"
                        ? "No upcoming trips. Start a new booking to get going."
                        : tripTab === "past" || shellView === "history"
                          ? "No past trips yet."
                          : "You have no bookings yet."
                  }
                  onNewBooking={() => startBooking()}
                />
              </>
            )}
          </div>
        )}
    </CustomerBookingShell>
  );
}

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  isText = false,
}: {
  label: string;
  value: number | string;
  accent: "brand" | "muted" | "sky";
  isText?: boolean;
}) {
  const accents = {
    brand: "text-brand",
    muted: "text-dark dark:text-white",
    sky: "text-sky-600 dark:text-sky-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-dark-elevated">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 ${isText ? "text-xl" : "text-3xl"} font-semibold ${accents[accent]}`}>
        {value}
      </p>
    </div>
  );
}

function TripTabs({
  active,
  onChange,
  counts,
}: {
  active: TripTab;
  onChange: (tab: TripTab) => void;
  counts: { all: number; active: number; past: number };
}) {
  const tabs: { id: TripTab; label: string; count: number }[] = [
    { id: "all", label: "All bookings", count: counts.all },
    { id: "active", label: "Upcoming", count: counts.active },
    { id: "past", label: "Past", count: counts.past },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200/80 dark:border-white/10">
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              selected
                ? "text-brand"
                : "text-muted hover:text-dark dark:hover:text-white"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-muted">({tab.count})</span>
            {selected && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function BookingCardList({
  trips,
  loading,
  emptyMessage,
  onNewBooking,
}: {
  trips: BookingRow[];
  loading: boolean;
  emptyMessage: string;
  onNewBooking: () => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-20 text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-dark-elevated">
        <p className="text-muted">{emptyMessage}</p>
        <button
          type="button"
          onClick={onNewBooking}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          New booking
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {trips.map((booking) => (
        <li key={booking.id}>
          <BookingCard booking={booking} />
        </li>
      ))}
    </ul>
  );
}

function BookingCard({ booking }: { booking: BookingRow }) {
  const statusLabel = formatBookingStatus(booking.status);
  const route = `${booking.pickupAddress} → ${booking.dropoffAddress}`;

  return (
    <Link
      href={`/booking/${booking.reference}`}
      className="group block rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:border-brand/30 hover:shadow-md dark:border-white/10 dark:bg-dark-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 text-brand" />
          <span className="font-medium text-dark dark:text-white">{booking.reference}</span>
          <span>·</span>
          <span>{format(new Date(booking.pickupDate), "h:mm a")}</span>
        </div>
        <button
          type="button"
          className="rounded-lg p-1 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/10"
          aria-label="More options"
          onClick={(e) => e.preventDefault()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-dark dark:text-white">
        {format(new Date(booking.pickupDate), "EEE d MMMM yyyy")}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm text-muted leading-relaxed">{route}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand dark:bg-brand/15">
            {statusLabel}
          </span>
          {booking.estimatedPrice != null && (
            <span className="text-xs text-muted">£{booking.estimatedPrice}</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Paperclip className="h-3.5 w-3.5" />
            Trip
          </span>
          <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="mt-3">
        <BookingTripPaymentActions
          reference={booking.reference}
          status={booking.status}
          paymentStatus={booking.paymentStatus}
          squarePaymentLinkUrl={booking.squarePaymentLinkUrl}
          amountDue={booking.amountDue}
          estimatedPrice={booking.estimatedPrice}
        />
      </div>
    </Link>
  );
}
