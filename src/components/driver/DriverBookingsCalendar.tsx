"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
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
};

type CalendarEntry = {
  booking: CalendarBooking;
  leg: "outbound" | "return";
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DriverBookingsCalendar() {
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

  const selectedDateEntries = selectedDateKey ? (entriesByDate.get(selectedDateKey) ?? []) : [];

  function selectDate(day: Date) {
    const key = toUkDateKey(day);
    setSelectedDateKey(key);
    const entries = entriesByDate.get(key) ?? [];
    setSelectedEntry(entries[0] ?? null);
  }

  function dayCellClass(day: Date, inMonth: boolean, isSelected: boolean, isHoliday: boolean) {
    const base =
      "relative flex min-h-[88px] flex-col rounded-lg border p-2 text-left transition-colors sm:min-h-[100px]";

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
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className={`flex-1 ${panelCard} p-4 sm:p-6`}>
        <div className="mb-6 flex items-center justify-between gap-4">
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
            <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
              {WEEKDAYS.map((label) => (
                <div
                  key={label}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
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

      <aside className={`w-full shrink-0 xl:w-[380px] ${panelCard} p-4 sm:p-6`}>
        {!selectedDateKey ? (
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a date to view paid bookings
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 border-b border-gray-200 pb-4 dark:border-white/10">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {formatUkDate(`${selectedDateKey}T12:00:00`, "EEE d MMM yyyy")}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedDateEntries.length === 0
                  ? "No paid bookings on this date"
                  : `${selectedDateEntries.length} booking${selectedDateEntries.length === 1 ? "" : "s"}`}
              </p>
              {bankHolidays.get(selectedDateKey) && (
                <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">
                  UK bank holiday: {bankHolidays.get(selectedDateKey)}
                </p>
              )}
            </div>

            {selectedDateEntries.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedDateEntries.map((entry) => {
                  const active =
                    selectedEntry?.booking.id === entry.booking.id &&
                    selectedEntry?.leg === entry.leg;
                  return (
                    <button
                      key={`${entry.booking.id}-${entry.leg}`}
                      type="button"
                      onClick={() => setSelectedEntry(entry)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "bg-emerald-500 text-white"
                          : isLight
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-white/10 text-gray-300 hover:bg-white/15"
                      }`}
                    >
                      {entry.booking.reference}
                      {entry.leg === "return" ? " (return)" : ""}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedEntry ? (
              <BookingDetailPanel
                entry={selectedEntry}
                isLight={isLight}
                statusColors={statusColors}
              />
            ) : selectedDateEntries.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nothing scheduled.</p>
            ) : null}
          </>
        )}
      </aside>
    </div>
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
    </div>
  );
}
