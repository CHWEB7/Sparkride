"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  Phone,
  User,
  Plane,
  CreditCard,
  Clock,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import {
  BOOKING_STATUS_COLORS_DARK,
  BOOKING_STATUS_COLORS_LIGHT,
  formatBookingStatus,
  type BookingStatusValue,
} from "@/lib/booking-status";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payment-status";
import { BookingCalendarActions } from "@/components/booking/BookingCalendarActions";
import type { PaymentStatus } from "@prisma/client";
import {
  addMonths,
  formatMonthLabel,
  formatUkDate,
  formatUkTime,
  getMonthGrid,
  getUkBankHolidaysForMonth,
  isSameMonth,
  isTodayInUk,
  toUkDateKey,
} from "@/lib/uk-calendar";

type CalendarBooking = {
  id: string;
  reference: string;
  status: string;
  journeyType: string;
  serviceType: string;
  tripType: string;
  airportName: string | null;
  airportCode: string | null;
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
  paymentStatus: PaymentStatus;
  amountDue?: number | null;
  paidAt?: string | null;
  driver?: { name: string; vehicleLabel: string | null } | null;
};

type CalendarEntry = {
  booking: CalendarBooking;
  leg: "outbound" | "return";
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DriverBookingsCalendar({ fullHeight = false }: { fullHeight?: boolean }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const statusColors = isLight ? BOOKING_STATUS_COLORS_LIGHT : BOOKING_STATUS_COLORS_DARK;

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsWarning, setBookingsWarning] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingBookings(true);
    setBookingsWarning(null);

    fetch("/api/driver/bookings?calendar=1")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data?.error === "string" ? data.error : "Failed to load calendar bookings"
          );
        }
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setBookings([]);
          setBookingsWarning("Could not load paid bookings. The calendar is still available.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingBookings(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bankHolidays = useMemo(() => getUkBankHolidaysForMonth(month), [month]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();

    function addEntry(key: string, entry: CalendarEntry) {
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }

    for (const booking of bookings) {
      addEntry(toUkDateKey(booking.pickupDate), { booking, leg: "outbound" });
      if (booking.returnPickupDate) {
        addEntry(toUkDateKey(booking.returnPickupDate), { booking, leg: "return" });
      }
    }

    for (const [, list] of map) {
      list.sort((a, b) => {
        const aTime = a.leg === "return" ? a.booking.returnPickupDate! : a.booking.pickupDate;
        const bTime = b.leg === "return" ? b.booking.returnPickupDate! : b.booking.pickupDate;
        return new Date(aTime).getTime() - new Date(bTime).getTime();
      });
    }

    return map;
  }, [bookings]);

  const days = useMemo(() => getMonthGrid(month), [month]);

  const monthEntries = useMemo(() => {
    const entries: CalendarEntry[] = [];
    for (const [dateKey, list] of entriesByDate) {
      const day = new Date(`${dateKey}T12:00:00`);
      if (!isSameMonth(day, month)) continue;
      entries.push(...list);
    }
    return entries.sort((a, b) => {
      const aTime = getEntryPickupTime(a);
      const bTime = getEntryPickupTime(b);
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    });
  }, [entriesByDate, month]);

  const monthEntriesByDate = useMemo(() => {
    const groups = new Map<string, CalendarEntry[]>();
    for (const entry of monthEntries) {
      const key = getEntryDateKey(entry);
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [monthEntries]);

  function selectEntry(entry: CalendarEntry) {
    const key = getEntryDateKey(entry);
    setSelectedDateKey(key);
    setSelectedEntry(entry);
  }

  function selectDate(day: Date) {
    const key = toUkDateKey(day);
    setSelectedDateKey(key);
    const entries = entriesByDate.get(key) ?? [];
    setSelectedEntry(entries[0] ?? null);
  }

  function dayCellClass(day: Date, inMonth: boolean, isSelected: boolean, isHoliday: boolean) {
    const heightClass = fullHeight
      ? "min-h-0 flex-1"
      : "min-h-[88px] sm:min-h-[100px]";
    const base = `relative flex ${heightClass} flex-col rounded-lg border p-2 text-left transition-colors`;

    if (!inMonth) {
      return `${base} border-transparent opacity-40`;
    }

    if (isSelected) {
      return `${base} border-emerald-500 bg-emerald-50 dark:border-emerald-400/60 dark:bg-emerald-500/10`;
    }

    if (isHoliday) {
      return `${base} border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/5 hover:border-rose-300 dark:hover:border-rose-500/30`;
    }

    return isLight
      ? `${base} border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40`
      : `${base} border-white/10 bg-dark-elevated hover:border-emerald-400/40 hover:bg-white/5`;
  }

  const panelCard = isLight
    ? "rounded-xl border border-gray-200 bg-white shadow-sm"
    : "rounded-2xl border border-white/10 bg-dark-elevated";

  return (
    <div
      className={`grid gap-4 xl:gap-5 ${
        fullHeight ? "h-full min-h-0 lg:grid-cols-2" : "lg:grid-cols-2"
      }`}
    >
      <div className={`flex min-h-0 flex-col ${fullHeight ? "flex-1" : "flex-1"} ${panelCard} p-4 sm:p-5`}>
        <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatMonthLabel(month)}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              UK calendar · paid bookings only
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelectedDateKey(toUkDateKey(now));
                const key = toUkDateKey(now);
                setSelectedEntry(entriesByDate.get(key)?.[0] ?? null);
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {bookingsWarning && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            {bookingsWarning}
          </div>
        )}

        {loadingBookings && (
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Loading paid bookings…</p>
        )}

        <>
            <div className="mb-2 grid shrink-0 grid-cols-7 gap-1 sm:gap-2">
              {WEEKDAYS.map((label) => (
                <div
                  key={label}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {label}
                </div>
              ))}
            </div>

            <div
              className={`grid min-h-0 flex-1 grid-cols-7 gap-1 sm:gap-2 ${
                fullHeight ? "grid-rows-6" : ""
              }`}
            >
              {days.map((day) => {
                const key = toUkDateKey(day);
                const inMonth = isSameMonth(day, month);
                const entries = entriesByDate.get(key) ?? [];
                const holidayName = bankHolidays.get(key);
                const isSelected = selectedDateKey === key;
                const today = isTodayInUk(day);

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!inMonth}
                    onClick={() => inMonth && selectDate(day)}
                    className={dayCellClass(day, inMonth, isSelected, Boolean(holidayName))}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-sm font-medium ${
                          today
                            ? "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"
                            : isLight
                              ? "text-gray-900"
                              : "text-white"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {entries.length > 0 && (
                        <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {entries.length}
                        </span>
                      )}
                    </div>

                    {holidayName && inMonth && (
                      <span className="mt-1 line-clamp-1 text-[10px] font-medium text-rose-600 dark:text-rose-300">
                        {holidayName}
                      </span>
                    )}

                    <div className="mt-1 space-y-0.5">
                      {entries.slice(0, 2).map((entry) => (
                        <div
                          key={`${entry.booking.id}-${entry.leg}`}
                          className="truncate rounded bg-emerald-500/15 px-1 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"
                        >
                          {formatUkTime(
                            entry.leg === "return"
                              ? entry.booking.returnPickupDate!
                              : entry.booking.pickupDate
                          )}{" "}
                          {entry.booking.reference}
                          {entry.leg === "return" ? " · Ret" : ""}
                        </div>
                      ))}
                      {entries.length > 2 && (
                        <div className="text-[10px] text-gray-500">+{entries.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
        </>
      </div>

      <aside
        className={`flex min-h-0 min-w-0 flex-col ${fullHeight ? "h-full" : "min-h-[480px]"} ${panelCard}`}
      >
        <div className="shrink-0 border-b border-gray-200 px-4 py-4 dark:border-white/10 sm:px-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Bookings</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {formatMonthLabel(month)} · {monthEntries.length} trip
            {monthEntries.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
          {loadingBookings ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading bookings…
            </p>
          ) : monthEntries.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-3 h-9 w-9 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No paid bookings in {formatMonthLabel(month)}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {monthEntriesByDate.map(([dateKey, dayEntries]) => {
                const day = new Date(`${dateKey}T12:00:00`);
                const weekday = formatUkDate(day, "EEE").toUpperCase();
                const dayNum = day.getDate();

                return (
                  <li key={dateKey}>
                    <div className="flex gap-3">
                      <div className="flex w-10 shrink-0 flex-col items-center pt-3 text-center">
                        <span className="text-[10px] font-semibold tracking-wide text-gray-400 dark:text-gray-500">
                          {weekday}
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {dayNum}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        {dayEntries.map((entry) => (
                          <MonthBookingListCard
                            key={`${entry.booking.id}-${entry.leg}`}
                            entry={entry}
                            isLight={isLight}
                            selected={
                              selectedEntry?.booking.id === entry.booking.id &&
                              selectedEntry?.leg === entry.leg
                            }
                            onSelect={() => selectEntry(entry)}
                          />
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {selectedEntry && (
          <div className="shrink-0 border-t border-gray-200 bg-gray-50/80 px-4 py-4 dark:border-white/10 dark:bg-white/5 sm:px-5 max-h-[40%] overflow-y-auto">
            <BookingDetailPanel
              entry={selectedEntry}
              isLight={isLight}
              statusColors={statusColors}
            />
          </div>
        )}
      </aside>
    </div>
  );
}

function getEntryDateKey(entry: CalendarEntry): string {
  return toUkDateKey(getEntryPickupTime(entry));
}

function getEntryPickupTime(entry: CalendarEntry): string {
  return entry.leg === "return" ? entry.booking.returnPickupDate! : entry.booking.pickupDate;
}

function getBookingListTitle(booking: CalendarBooking, leg: CalendarEntry["leg"]): string {
  if (booking.serviceType === "PRE_BOOKED") {
    return leg === "return" ? "Pre-booked journey · Return" : "Pre-booked journey";
  }

  const hub = booking.airportName ?? "Transfer";
  const code = booking.airportCode ? ` (${booking.airportCode})` : "";
  const direction = booking.tripType === "FROM_AIRPORT" ? "Arrivals" : "Departures";
  const base = `${hub}${code} ${direction}`;
  return leg === "return" ? `${base} · Return` : base;
}

function truncateAddress(address: string, max = 36): string {
  if (address.length <= max) return address;
  return `${address.slice(0, max).trim()}…`;
}

function MonthBookingListCard({
  entry,
  isLight,
  selected,
  onSelect,
}: {
  entry: CalendarEntry;
  isLight: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const { booking, leg } = entry;
  const pickupTime = getEntryPickupTime(entry);
  const driverName = booking.driver?.name ?? "Assigned driver";
  const vehicleInfo =
    booking.driver?.vehicleLabel ??
    `${booking.vehicleType} · ${booking.passengers} pax · ${booking.luggage} bags`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border text-left transition-all ${
        selected
          ? "border-brand bg-brand-light/30 shadow-sm ring-1 ring-brand/25 dark:border-brand-end dark:bg-brand/10"
          : isLight
            ? "border-gray-200 bg-white hover:border-brand/30 hover:shadow-sm"
            : "border-white/10 bg-dark-elevated hover:border-brand/40"
      }`}
    >
      <div className="flex gap-0 overflow-hidden rounded-xl">
        <div className="w-1 shrink-0 bg-brand-gradient" aria-hidden />
        <div className="min-w-0 flex-1 p-3.5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-brand dark:text-brand-end">
              {formatUkTime(pickupTime)}
              {leg === "return" && (
                <span className="ml-1.5 text-[10px] font-bold uppercase text-muted">Return</span>
              )}
            </span>
            <MoreHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
          </div>

          <h4
            className={`text-sm font-semibold leading-snug ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            {getBookingListTitle(booking, leg)}
          </h4>

          <p className={`mt-1.5 text-sm ${isLight ? "text-gray-800" : "text-gray-200"}`}>
            {booking.customerName}
          </p>

          <p className={`mt-1 flex items-center gap-1.5 text-xs ${isLight ? "text-gray-500" : "text-gray-400"}`}>
            <User className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span>
              With: {driverName}
              <span className="text-muted"> ({vehicleInfo})</span>
            </span>
          </p>

          <p className={`mt-1.5 flex items-start gap-1.5 text-xs ${isLight ? "text-gray-500" : "text-gray-400"}`}>
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="line-clamp-2">{truncateAddress(booking.pickupAddress)}</span>
          </p>
        </div>
      </div>
    </button>
  );
}

function BookingDetailPanel({
  entry,
  isLight,
  statusColors,
}: {
  entry: CalendarEntry;
  isLight: boolean;
  statusColors: Record<BookingStatusValue, string>;
}) {
  const { booking, leg } = entry;
  const pickupTime =
    leg === "return" ? booking.returnPickupDate! : booking.pickupDate;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-lg font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
          {booking.reference}
        </span>
        {leg === "return" && (
          <span className="rounded-full bg-brand/20 px-2 py-0.5 text-xs font-bold text-brand-end">
            RETURN LEG
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColors[booking.status as BookingStatusValue] ?? ""}`}
        >
          {formatBookingStatus(booking.status)}
        </span>
      </div>

      <div className={`flex items-center gap-2 ${isLight ? "text-gray-500" : "text-gray-400"}`}>
        <Clock className="h-4 w-4 shrink-0 text-brand" />
        <span>
          {formatUkDate(pickupTime, "EEE d MMM yyyy")} · {formatUkTime(pickupTime)}
        </span>
      </div>

      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <div>
          <div className={isLight ? "text-gray-500" : "text-gray-400"}>
            {booking.serviceType === "PRE_BOOKED"
              ? "Pre-booked journey"
              : booking.journeyType === "RETURN"
                ? `Return trip · ${booking.airportName}`
                : `${booking.tripType === "TO_AIRPORT" ? "To" : "From"} ${booking.airportName}`}
          </div>
          <div className={isLight ? "text-gray-900" : "text-white"}>{booking.pickupAddress}</div>
          <div className={isLight ? "text-gray-500" : "text-gray-500"}>
            → {booking.dropoffAddress}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-brand" />
          <span className={isLight ? "text-gray-900" : "text-white"}>{booking.customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-brand" />
          <a href={`tel:${booking.customerPhone}`} className="text-brand hover:underline">
            {booking.customerPhone}
          </a>
        </div>
        <div className={isLight ? "text-gray-500" : "text-gray-400"}>{booking.customerEmail}</div>
      </div>

      <div className={`${isLight ? "text-gray-500" : "text-gray-400"}`}>
        <Plane className="mr-1 inline h-4 w-4 text-brand" />
        {booking.vehicleType} · {booking.passengers} pax · {booking.luggage} bags
        {booking.flightNumber && ` · Out: ${booking.flightNumber}`}
        {booking.returnFlightNumber && ` · Ret: ${booking.returnFlightNumber}`}
      </div>

      {(booking.estimatedPrice || booking.amountDue) && (
        <div className="font-bold text-brand-end">
          £{booking.amountDue ?? booking.estimatedPrice}
        </div>
      )}

      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-brand" />
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_COLORS[booking.paymentStatus]}`}
        >
          {PAYMENT_STATUS_LABELS[booking.paymentStatus]}
        </span>
        {booking.paidAt && (
          <span className={`text-xs ${isLight ? "text-gray-500" : "text-gray-400"}`}>
            · {formatUkDate(booking.paidAt, "d MMM yyyy HH:mm")}
          </span>
        )}
      </div>

      {booking.notes && (
        <div className={`italic ${isLight ? "text-gray-500" : "text-gray-400"}`}>
          Note: {booking.notes}
        </div>
      )}

      <div className="pt-2">
        <div className={`mb-2 text-xs font-semibold uppercase tracking-wide ${isLight ? "text-gray-500" : "text-gray-400"}`}>
          Add to calendar
        </div>
        <BookingCalendarActions
          reference={booking.reference}
          hasReturn={booking.journeyType === "RETURN"}
          apiBase="/api/driver/bookings"
          leg={leg}
          compact
        />
      </div>
    </div>
  );
}
