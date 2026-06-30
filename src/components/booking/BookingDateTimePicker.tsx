"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  getMonthGrid,
  isSameMonth,
  isTodayInUk,
  toUkDateKey,
} from "@/lib/uk-calendar";

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

type TimePeriod = {
  id: string;
  label: string;
  slots: string[];
};

function groupTimeSlotsByPeriod(slots: string[]): TimePeriod[] {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const evening: string[] = [];
  const night: string[] = [];

  for (const slot of slots) {
    const hour = Number(slot.split(":")[0]);
    if (hour < 12) morning.push(slot);
    else if (hour < 17) afternoon.push(slot);
    else if (hour < 21) evening.push(slot);
    else night.push(slot);
  }

  return [
    { id: "morning", label: "Morning", slots: morning },
    { id: "afternoon", label: "Afternoon", slots: afternoon },
    { id: "evening", label: "Evening", slots: evening },
    { id: "night", label: "Night", slots: night },
  ].filter((period) => period.slots.length > 0);
}

const TIME_PERIODS = groupTimeSlotsByPeriod(TIME_SLOTS);
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  square?: boolean;
};

export function BookingDateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
  title = "Select time",
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
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="mb-5 shrink-0 text-2xl font-semibold tracking-[-0.02em] dark:text-white">
        {title}
      </h2>

      <div className="flex min-h-0 flex-1 flex-col gap-6 md:flex-row md:gap-8">
        {/* Month calendar */}
        <div className="flex w-full shrink-0 flex-col md:w-[300px] lg:w-[320px]">
          <div className="mb-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-dark dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h3 className="min-w-[7rem] text-center text-lg font-semibold text-dark dark:text-white">
              {monthName}
            </h3>

            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-dark dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-muted"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-3">
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
                  className={`flex h-9 items-center justify-center text-sm transition-colors ${
                    disabled
                      ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                      : !inMonth
                        ? "text-gray-400 hover:text-muted dark:text-gray-500"
                        : selected
                          ? "font-semibold text-brand"
                          : today
                            ? "font-medium text-brand hover:text-brand/80"
                            : "font-medium text-dark hover:text-brand dark:text-gray-100 dark:hover:text-brand-end"
                  }`}
                >
                  <span
                    className={
                      selected && inMonth && !disabled
                        ? "flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white"
                        : ""
                    }
                  >
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:border-l md:border-gray-200/60 md:pl-8 dark:md:border-white/10">
          <p className="mb-4 shrink-0 text-sm font-semibold text-muted">Available times</p>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="space-y-6">
              {TIME_PERIODS.map((period) => (
                <div key={period.id}>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    {period.label}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {period.slots.map((slot) => {
                      const selected = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => onTimeChange(slot)}
                          className={`w-full border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                            square ? "rounded-none" : "rounded-xl"
                          } ${
                            selected
                              ? "border-brand bg-brand-light/40 text-brand ring-1 ring-brand/30 dark:bg-brand/10 dark:text-brand-end"
                              : "border-gray-200/80 bg-white text-dark hover:border-brand/40 dark:border-white/10 dark:bg-dark dark:text-gray-100"
                          }`}
                        >
                          {formatBookingTimeLabel(slot)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
