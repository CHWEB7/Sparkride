"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format } from "date-fns";
import { enGB } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  formatMonthLabel,
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
const VISIBLE_DAYS = 7;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatBookingTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;
  const minutes = String(m).padStart(2, "0");
  return `${hour12}.${minutes} ${period}`;
}

function startOfWeekMonday(day: Date): Date {
  const d = new Date(day);
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diff);
  d.setHours(12, 0, 0, 0);
  return d;
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
  const panelRef = useRef<HTMLDivElement>(null);

  const [monthOpen, setMonthOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = date ? new Date(`${date}T12:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [windowStart, setWindowStart] = useState(() => {
    const base = date ? new Date(`${date}T12:00:00`) : new Date();
    const minDay = new Date(`${min}T12:00:00`);
    const week = startOfWeekMonday(base < minDay ? minDay : base);
    return week < minDay ? minDay : week;
  });

  const days = useMemo(() => {
    return Array.from({ length: VISIBLE_DAYS }, (_, i) => addDays(windowStart, i));
  }, [windowStart]);

  const monthGrid = useMemo(() => getMonthGrid(viewMonth), [viewMonth]);

  const monthLabel = format(date ? new Date(`${date}T12:00:00`) : windowStart, "MMMM yyyy", {
    locale: enGB,
  });

  const minWindow = new Date(`${min}T12:00:00`);

  useEffect(() => {
    if (!monthOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMonthOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [monthOpen]);

  function shiftWindow(delta: number) {
    setWindowStart((current) => {
      const next = addDays(current, delta);
      return next < minWindow ? minWindow : next;
    });
  }

  function selectDate(key: string) {
    onDateChange(key);
    const selected = new Date(`${key}T12:00:00`);
    setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setWindowStart(startOfWeekMonday(selected < minWindow ? minWindow : selected));
  }

  function selectFromMonth(day: Date) {
    const key = toUkDateKey(day);
    if (key < min) return;
    selectDate(key);
    setMonthOpen(false);
  }

  const canShiftBack = toUkDateKey(windowStart) > min;

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row lg:gap-8">
      <div className="flex min-h-0 flex-1 flex-col lg:max-w-[55%]">
        <h2 className="mb-5 text-2xl font-semibold tracking-[-0.02em] dark:text-white">{title}</h2>

        <div className="mb-5 shrink-0" ref={panelRef}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setMonthOpen((open) => !open)}
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-dark dark:text-white hover:text-brand transition-colors"
                aria-expanded={monthOpen}
              >
                <Calendar className="h-4 w-4 text-brand" />
                {monthLabel}
                <ChevronRight
                  className={`h-4 w-4 text-muted transition-transform ${monthOpen ? "rotate-90" : ""}`}
                />
              </button>

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
                        onClick={() => selectDate(key)}
                        className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
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

            <AnimatePresence>
              {monthOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="w-[280px] rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-dark p-4 shadow-lg">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold dark:text-white">
                        {formatMonthLabel(viewMonth)}
                      </h3>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setViewMonth((m) => addMonths(m, -1))}
                          className="rounded-lg p-1.5 text-muted hover:bg-gray-100 dark:hover:bg-white/10"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                          }}
                          className="rounded-lg px-2 py-1 text-[10px] font-semibold text-brand hover:bg-brand-light/60 dark:hover:bg-brand/10"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMonth((m) => addMonths(m, 1))}
                          className="rounded-lg p-1.5 text-muted hover:bg-gray-100 dark:hover:bg-white/10"
                          aria-label="Next month"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-1 grid grid-cols-7 gap-0.5">
                      {WEEKDAYS.map((day) => (
                        <div
                          key={day}
                          className="py-1 text-center text-[10px] font-semibold uppercase text-muted"
                        >
                          {day.slice(0, 1)}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {monthGrid.map((day) => {
                        const key = toUkDateKey(day);
                        const inMonth = isSameMonth(day, viewMonth);
                        const disabled = !inMonth || key < min;
                        const selected = date === key;
                        const today = isTodayInUk(day);

                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={disabled}
                            onClick={() => selectFromMonth(day)}
                            className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                              !inMonth
                                ? "pointer-events-none text-transparent"
                                : disabled
                                  ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                                  : selected
                                    ? "bg-brand text-white"
                                    : today
                                      ? "text-brand ring-1 ring-brand/40 hover:bg-brand-light/50 dark:hover:bg-brand/10"
                                      : "text-dark dark:text-gray-200 hover:bg-brand-light/60 dark:hover:bg-white/5"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 lg:hidden">
          {TIME_SLOTS.map((slot) => {
            const selected = time === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onTimeChange(slot)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
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

      <div className="hidden min-h-0 flex-1 flex-col border-l border-gray-200/60 pl-6 dark:border-white/10 lg:flex">
        <p className="mb-4 shrink-0 text-sm font-semibold text-muted">Available times</p>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
            {TIME_SLOTS.map((slot) => {
              const selected = time === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onTimeChange(slot)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
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
      </div>
    </div>
  );
}
