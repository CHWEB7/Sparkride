"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  formatMonthLabel,
  getMonthGrid,
  isSameMonth,
  isTodayInUk,
  toUkDateKey,
} from "@/lib/uk-calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type BookingCalendarPickerProps = {
  value: string;
  onChange: (dateKey: string) => void;
  minDate?: string;
  label?: string;
};

export function BookingCalendarPicker({
  value,
  onChange,
  minDate,
  label,
}: BookingCalendarPickerProps) {
  const todayKey = toUkDateKey(new Date());
  const min = minDate ?? todayKey;

  const [month, setMonth] = useState(() => {
    const base = value ? new Date(`${value}T12:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const days = useMemo(() => getMonthGrid(month), [month]);

  function isDisabled(day: Date): boolean {
    return toUkDateKey(day) < min;
  }

  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-dark p-4 sm:p-5 shadow-sm">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-brand mb-3">{label}</p>
      )}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold dark:text-white">{formatMonthLabel(month)}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="rounded-lg p-2 text-muted hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-light/60 dark:hover:bg-brand/10 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-lg p-2 text-muted hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = toUkDateKey(day);
          const inMonth = isSameMonth(day, month);
          const selected = value === key;
          const disabled = !inMonth || isDisabled(day);
          const today = isTodayInUk(day);

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                !inMonth
                  ? "text-transparent pointer-events-none"
                  : disabled
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : selected
                      ? "bg-brand-gradient text-white shadow-md shadow-brand/25 scale-[1.02]"
                      : today
                        ? "ring-2 ring-brand/40 text-brand dark:text-brand-end hover:bg-brand-light/50 dark:hover:bg-brand/10"
                        : "text-dark dark:text-gray-200 hover:bg-brand-light/60 dark:hover:bg-white/5"
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
