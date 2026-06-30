"use client";

import { useEffect, useMemo, useState } from "react";
import type { TimePeriod } from "@/components/booking/time-slot-groups";
import { formatBookingTimeLabel } from "@/components/booking/time-slot-groups";

type TimePeriodScrollerProps = {
  periods: TimePeriod[];
  value: string;
  onChange: (time: string) => void;
  square?: boolean;
};

function findPeriodForTime(periods: TimePeriod[], time: string): string | null {
  if (!time) return null;
  for (const period of periods) {
    if (period.slots.includes(time)) return period.id;
  }
  return null;
}

export function TimePeriodScroller({
  periods,
  value,
  onChange,
  square = false,
}: TimePeriodScrollerProps) {
  const [activePeriodId, setActivePeriodId] = useState(
    () => findPeriodForTime(periods, value) ?? periods[0]?.id ?? ""
  );

  useEffect(() => {
    const match = findPeriodForTime(periods, value);
    if (match) setActivePeriodId(match);
  }, [value, periods]);

  const activePeriod = useMemo(
    () => periods.find((period) => period.id === activePeriodId) ?? periods[0],
    [activePeriodId, periods]
  );

  if (!activePeriod) return null;

  return (
    <div className="min-w-0 w-full max-w-full">
      <div className="mb-3 flex flex-wrap gap-2">
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => setActivePeriodId(period.id)}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm ${
              activePeriod.id === period.id
                ? "bg-brand text-white"
                : "border border-gray-300 bg-white text-gray-600 hover:border-brand/40 dark:border-white/15 dark:bg-dark dark:text-gray-300"
            } ${square ? "rounded-none" : "rounded-md"}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="min-w-0 w-full max-w-full overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:thin]">
        <div className="flex w-max gap-2 pb-1">
          {activePeriod.slots.map((slot) => {
            const selected = value === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onChange(slot)}
                className={`h-10 shrink-0 basis-[4.25rem] snap-start border px-2 text-center text-xs font-medium transition-all sm:basis-[4.5rem] sm:text-sm ${
                  square ? "rounded-none" : "rounded-lg"
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

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Swipe left or right to see more times in {activePeriod.label.toLowerCase()}.
      </p>
    </div>
  );
}
