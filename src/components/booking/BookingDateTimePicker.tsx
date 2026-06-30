"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { TimePeriodScroller } from "@/components/booking/TimePeriodScroller";
import { PICKUP_TIME_PERIODS } from "@/components/booking/time-slot-groups";
import {
  addMonths,
  getMonthGrid,
  isSameMonth,
  isTodayInUk,
  toUkDateKey,
} from "@/lib/uk-calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type BookingDateTimePickerProps = {
  date: string;
  time: string;
  onDateChange: (dateKey: string) => void;
  onTimeChange: (time: string) => void;
  minDate?: string;
  title?: string;
  square?: boolean;
};

export function BookingDateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
  title = "Select pickup date and time",
  square = false,
}: BookingDateTimePickerProps) {
  const todayKey = toUkDateKey(new Date());
  const min = minDate ?? todayKey;

  const [viewMonth, setViewMonth] = useState(() => {
    const base = date ? new Date(`${date}T12:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const monthGrid = useMemo(() => getMonthGrid(viewMonth), [viewMonth]);
  const monthName = format(viewMonth, "MMMM", { locale: enGB });

  function selectDate(day: Date) {
    const key = toUkDateKey(day);
    if (key < min) return;
    onDateChange(key);
    if (!isSameMonth(day, viewMonth)) {
      setViewMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  }

  return (
    <div className="w-full max-w-full space-y-4 overflow-hidden">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        <div className="mt-3 border border-brand/30 bg-brand-light/25 px-4 py-3 dark:border-brand/40 dark:bg-brand/10">
          <div className="flex items-start gap-2.5">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Pickup time — when your driver collects you
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                This is not your flight departure time or drop-off time. Choose when you want to be
                picked up from your address.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            className="p-1.5 text-gray-500 transition-colors hover:text-brand dark:text-gray-400"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{monthName}</h3>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="p-1.5 text-gray-500 transition-colors hover:text-brand dark:text-gray-400"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1 text-center text-[10px] font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {monthGrid.map((day) => {
            const key = toUkDateKey(day);
            const inMonth = isSameMonth(day, viewMonth);
            const isPast = key < min;
            const selected = date === key;
            const today = isTodayInUk(day);
            const disabled = isPast;

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => selectDate(day)}
                className={`flex h-8 items-center justify-center text-xs transition-colors ${
                  disabled
                    ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                    : !inMonth
                      ? "text-gray-400 dark:text-gray-500"
                      : selected
                        ? "bg-brand font-semibold text-white"
                        : today
                          ? "font-medium text-brand"
                          : "font-medium text-gray-800 hover:text-brand dark:text-gray-100"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 border-t border-gray-200 pt-4 dark:border-white/10">
        <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Pickup time</p>
        <TimePeriodScroller
          periods={PICKUP_TIME_PERIODS}
          value={time}
          onChange={onTimeChange}
          square={square}
        />
      </div>
    </div>
  );
}

// Re-export for other booking components
export { formatBookingTimeLabel } from "@/components/booking/time-slot-groups";
