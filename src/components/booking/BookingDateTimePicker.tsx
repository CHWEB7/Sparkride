"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { enGB } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toUkDateKey } from "@/lib/uk-calendar";

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 5; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();
const VISIBLE_DAYS = 7;

export function formatBookingTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;
  const minutes = String(m).padStart(2, "0");
  return `${hour12}.${minutes} ${period}`;
}

type BookingDateTimePickerProps = {
  date: string;
  time: string;
  onDateChange: (dateKey: string) => void;
  onTimeChange: (time: string) => void;
  minDate?: string;
  title?: string;
};

export function BookingDateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
  title = "Select time",
}: BookingDateTimePickerProps) {
  const todayKey = toUkDateKey(new Date());
  const min = minDate ?? todayKey;

  const [windowStart, setWindowStart] = useState(() => {
    const base = date ? new Date(`${date}T12:00:00`) : new Date();
    return base < new Date(`${min}T12:00:00`) ? new Date(`${min}T12:00:00`) : base;
  });

  const days = useMemo(() => {
    return Array.from({ length: VISIBLE_DAYS }, (_, i) => addDays(windowStart, i));
  }, [windowStart]);

  const monthLabel = format(date ? new Date(`${date}T12:00:00`) : windowStart, "MMMM yyyy", {
    locale: enGB,
  });

  const minWindow = new Date(`${min}T12:00:00`);

  function shiftWindow(delta: number) {
    setWindowStart((current) => {
      const next = addDays(current, delta);
      return next < minWindow ? minWindow : next;
    });
  }

  const canShiftBack = toUkDateKey(windowStart) > min;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="text-2xl font-semibold tracking-[-0.02em] dark:text-white mb-5">{title}</h2>

      <div className="shrink-0 mb-5">
        <p className="text-sm font-semibold text-dark dark:text-white mb-3">{monthLabel}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftWindow(-VISIBLE_DAYS)}
            disabled={!canShiftBack}
            className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
            aria-label="Previous dates"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-start justify-between gap-1.5 overflow-hidden">
            {days.map((day) => {
              const key = toUkDateKey(day);
              const disabled = key < min;
              const selected = date === key;
              const weekday = format(day, "EEE", { locale: enGB });

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onDateChange(key)}
                  className="flex flex-1 flex-col items-center gap-1.5 min-w-0"
                >
                  <span className="text-[11px] font-medium text-muted">{weekday}</span>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      disabled
                        ? "text-gray-300 dark:text-gray-600 line-through"
                        : selected
                          ? "bg-brand text-white shadow-sm"
                          : "border border-gray-200 dark:border-white/15 text-dark dark:text-white hover:border-brand/50"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => shiftWindow(VISIBLE_DAYS)}
            className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Next dates"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {TIME_SLOTS.map((slot) => {
          const selected = time === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onTimeChange(slot)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                selected
                  ? "border-brand bg-brand-light/40 dark:bg-brand/10 text-brand dark:text-brand-end ring-1 ring-brand/30"
                  : "border-gray-200/80 dark:border-white/10 bg-white dark:bg-dark text-dark dark:text-gray-100 hover:border-brand/40"
              }`}
            >
              {formatBookingTimeLabel(slot)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
