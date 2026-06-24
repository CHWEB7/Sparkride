"use client";

import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Plane,
  Search,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_COLORS_DARK,
  BOOKING_STATUS_COLORS_LIGHT,
  formatBookingStatus,
  type BookingStatusValue,
} from "@/lib/booking-status";
import {
  canDriverAction,
  driverActionLabel,
  type DriverBookingAction,
} from "@/lib/driver-booking-actions";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payment-status";
import type { BookingStatus, PaymentStatus } from "@prisma/client";

type Booking = {
  id: string;
  reference: string;
  status: string;
  journeyType: string;
  serviceType: string;
  tripType: string;
  airportName: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  returnPickupDate: string | null;
  passengers: number;
  luggage: number;
  vehicleType: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  flightNumber: string | null;
  returnFlightNumber: string | null;
  notes: string | null;
  estimatedPrice: number | null;
  paymentStatus?: string;
  amountDue?: number | null;
  squarePaymentLinkUrl?: string | null;
  paidAt?: string | null;
};

const ALL_ACTIONS: DriverBookingAction[] = [
  "accept",
  "send_payment_link",
  "complete",
  "cancel",
];

function tripSummary(booking: Booking): string {
  if (booking.serviceType === "PRE_BOOKED") {
    return booking.journeyType === "RETURN" ? "Pre-booked return" : "Pre-booked";
  }
  if (booking.journeyType === "RETURN") {
    return `Return · ${booking.airportName ?? "Hub"}`;
  }
  return `${booking.tripType === "TO_AIRPORT" ? "To" : "From"} ${booking.airportName ?? "hub"}`;
}

function shortAddress(address: string): string {
  const parts = address.split(",");
  return parts[0]?.trim() || address;
}

export function DriverBookingsTable({
  bookings: initial,
  theme: themeProp,
  fullHeight = false,
}: {
  bookings: Booking[];
  theme?: "dark" | "light";
  fullHeight?: boolean;
}) {
  const { theme: contextTheme } = useTheme();
  const theme = themeProp ?? contextTheme;
  const isLight = theme === "light";
  const statusColors = isLight ? BOOKING_STATUS_COLORS_LIGHT : BOOKING_STATUS_COLORS_DARK;

  const [bookings, setBookings] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [acting, setActing] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.reference.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.pickupAddress.toLowerCase().includes(q) ||
        b.dropoffAddress.toLowerCase().includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  const selectedBookings = bookings.filter((b) => selected.has(b.id));
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((b) => selected.has(b.id));

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((b) => next.delete(b.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((b) => next.add(b.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function availableActionsForSelection(): DriverBookingAction[] {
    if (selectedBookings.length === 0) return [];
    return ALL_ACTIONS.filter((action) =>
      selectedBookings.every((b) =>
        canDriverAction(
          {
            status: b.status as BookingStatus,
            paymentStatus: (b.paymentStatus ?? "NOT_REQUIRED") as PaymentStatus,
          },
          action
        )
      )
    );
  }

  async function runAction(action: DriverBookingAction, ids: string[]) {
    setActing(true);
    setActionMenuOpen(false);
    setRowMenuId(null);
    try {
      const res = await fetch("/api/driver/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 207) {
        throw new Error(data.error ?? "Action failed");
      }
      const results = data.results as Array<{
        id: string;
        ok: boolean;
        error?: string;
        booking?: Booking;
      }>;
      const failures = results.filter((r) => !r.ok);
      if (failures.length > 0) {
        alert(
          failures.map((f) => `${f.id.slice(0, 8)}…: ${f.error}`).join("\n")
        );
      }
      setBookings((prev) => {
        const map = new Map(prev.map((b) => [b.id, b]));
        for (const r of results) {
          if (r.ok && r.booking) map.set(r.id, { ...map.get(r.id)!, ...r.booking });
        }
        return Array.from(map.values());
      });
      setSelected(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(false);
    }
  }

  const bulkActions = availableActionsForSelection();

  const counts = BOOKING_STATUSES.reduce(
    (acc, s) => {
      acc[s] = bookings.filter((b) => b.status === s).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const thClass = `px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${
    isLight ? "text-gray-500 bg-gray-50" : "text-gray-400 bg-white/5"
  }`;
  const tdClass = `px-3 py-3 text-sm align-top ${isLight ? "text-gray-700" : "text-gray-300"}`;
  const tableWrap = isLight
    ? "rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    : "rounded-xl border border-white/10 bg-dark-elevated overflow-hidden";

  return (
    <div className={fullHeight ? "flex h-full min-h-0 flex-col gap-4" : "space-y-4"}>
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search reference, customer, address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none ${
              isLight
                ? "border border-gray-200 bg-white text-gray-900 focus:border-emerald-500"
                : "border border-white/10 bg-white/5 text-white focus:border-brand"
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selected.size} selected
            </span>
          )}
          <div className="relative" ref={actionMenuRef}>
            <button
              type="button"
              disabled={acting || bulkActions.length === 0}
              onClick={() => setActionMenuOpen((o) => !o)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                isLight
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-brand-gradient text-white"
              }`}
            >
              {acting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
              Bulk actions
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            {actionMenuOpen && bulkActions.length > 0 && (
              <div
                className={`absolute right-0 z-20 mt-1 min-w-[180px] rounded-lg border py-1 shadow-lg ${
                  isLight
                    ? "border-gray-200 bg-white"
                    : "border-white/10 bg-dark-elevated"
                }`}
              >
                {bulkActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => runAction(action, Array.from(selected))}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${
                      action === "cancel" ? "text-red-600 dark:text-red-400" : ""
                    }`}
                  >
                    {driverActionLabel(action)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "ALL"
              ? isLight
                ? "bg-emerald-500 text-white"
                : "bg-brand-gradient text-white"
              : isLight
                ? "border border-gray-200 bg-white text-gray-600"
                : "bg-white/5 text-gray-400"
          }`}
        >
          All ({bookings.length})
        </button>
        {BOOKING_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? isLight
                  ? "bg-emerald-500 text-white"
                  : "bg-brand-gradient text-white"
                : isLight
                  ? "border border-gray-200 bg-white text-gray-600"
                  : "bg-white/5 text-gray-400"
            }`}
          >
            {formatBookingStatus(s)} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-16 text-center text-gray-500">
          <div>
            <Plane className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p>No bookings found</p>
          </div>
        </div>
      ) : (
        <div
          className={`${tableWrap} ${fullHeight ? "flex min-h-0 flex-1 flex-col" : ""}`}
        >
          <div className={`overflow-x-auto ${fullHeight ? "min-h-0 flex-1 overflow-y-auto" : ""}`}>
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className={isLight ? "border-b border-gray-200" : "border-b border-white/10"}>
                  <th className={`${thClass} w-10`}>
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      aria-label="Select all"
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Reference</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Date & time</th>
                  <th className={thClass}>Route</th>
                  <th className={thClass}>Trip</th>
                  <th className={thClass}>Payment</th>
                  <th className={`${thClass} w-12`} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const rowActions = ALL_ACTIONS.filter((action) =>
                    canDriverAction(
                      {
                        status: booking.status as BookingStatus,
                        paymentStatus: (booking.paymentStatus ?? "NOT_REQUIRED") as PaymentStatus,
                      },
                      action
                    )
                  );
                  const paymentStatus = (booking.paymentStatus ?? "NOT_REQUIRED") as PaymentStatus;

                  return (
                    <tr
                      key={booking.id}
                      className={`${
                        isLight ? "border-b border-gray-100 hover:bg-gray-50/80" : "border-b border-white/5 hover:bg-white/[0.02]"
                      } ${selected.has(booking.id) ? (isLight ? "bg-emerald-50/50" : "bg-brand/5") : ""}`}
                    >
                      <td className={tdClass}>
                        <input
                          type="checkbox"
                          checked={selected.has(booking.id)}
                          onChange={() => toggleOne(booking.id)}
                          aria-label={`Select ${booking.reference}`}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${
                            statusColors[booking.status as BookingStatusValue] ?? ""
                          }`}
                        >
                          {formatBookingStatus(booking.status)}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <div className={`font-semibold ${isLight ? "text-gray-900" : "text-white"}`}>
                          {booking.reference}
                        </div>
                        {booking.journeyType === "RETURN" && (
                          <span className="text-xs text-brand-end">Return</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <div className={`font-medium ${isLight ? "text-gray-900" : "text-white"}`}>
                          {booking.customerName}
                        </div>
                        <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                        <a
                          href={`tel:${booking.customerPhone}`}
                          className="text-xs text-brand hover:underline"
                        >
                          {booking.customerPhone}
                        </a>
                      </td>
                      <td className={tdClass}>
                        <div className="whitespace-nowrap font-medium">
                          {format(new Date(booking.pickupDate), "EEE d MMM yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(booking.pickupDate), "HH:mm")}
                        </div>
                        {booking.returnPickupDate && (
                          <div className="mt-1 text-xs text-gray-500">
                            Ret: {format(new Date(booking.returnPickupDate), "d MMM · HH:mm")}
                          </div>
                        )}
                      </td>
                      <td className={tdClass}>
                        <div className="max-w-[180px]">
                          <div className="truncate" title={booking.pickupAddress}>
                            {shortAddress(booking.pickupAddress)}
                          </div>
                          <div className="truncate text-xs text-gray-500" title={booking.dropoffAddress}>
                            → {shortAddress(booking.dropoffAddress)}
                          </div>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <div className="text-xs">{tripSummary(booking)}</div>
                        <div className="text-xs text-gray-500">
                          {booking.vehicleType} · {booking.passengers} pax · {booking.luggage} bags
                        </div>
                        {booking.flightNumber && (
                          <div className="text-xs text-gray-500">Flight {booking.flightNumber}</div>
                        )}
                      </td>
                      <td className={tdClass}>
                        {booking.estimatedPrice != null && (
                          <div className={`font-semibold ${isLight ? "text-gray-900" : "text-white"}`}>
                            £{booking.estimatedPrice}
                          </div>
                        )}
                        {paymentStatus !== "NOT_REQUIRED" && (
                          <span
                            className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              PAYMENT_STATUS_COLORS[paymentStatus]
                            }`}
                          >
                            {PAYMENT_STATUS_LABELS[paymentStatus]}
                          </span>
                        )}
                        {paymentStatus === "NOT_REQUIRED" && (
                          <span className="text-xs text-gray-500">Pay with driver</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <div className="relative">
                          <button
                            type="button"
                            disabled={acting || rowActions.length === 0}
                            onClick={() =>
                              setRowMenuId((id) => (id === booking.id ? null : booking.id))
                            }
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-30"
                            aria-label="Row actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {rowMenuId === booking.id && rowActions.length > 0 && (
                            <div
                              className={`absolute right-0 z-20 mt-1 min-w-[160px] rounded-lg border py-1 shadow-lg ${
                                isLight
                                  ? "border-gray-200 bg-white"
                                  : "border-white/10 bg-dark-elevated"
                              }`}
                            >
                              {rowActions.map((action) => (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => runAction(action, [booking.id])}
                                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${
                                    action === "cancel" ? "text-red-600 dark:text-red-400" : ""
                                  }`}
                                >
                                  {driverActionLabel(action)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            className={`shrink-0 px-4 py-2 text-xs ${
              isLight ? "border-t border-gray-100 text-gray-500" : "border-t border-white/10 text-gray-400"
            }`}
          >
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>
      )}
    </div>
  );
}
