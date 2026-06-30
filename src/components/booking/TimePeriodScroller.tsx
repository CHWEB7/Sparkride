"use client";

import type { TimePeriod } from "@/components/booking/time-slot-groups";
import { formatBookingTimeLabel } from "@/components/booking/time-slot-groups";

type TimePeriodScrollerProps = {
  periods: TimePeriod[];
  value: string;
  onChange: (time: string) => void;
  square?: boolean;
};

export function TimePeriodScroller({
  periods,
  value,
  onChange,
  square = false,
}: TimePeriodScrollerProps) {
  return (
    <div className="w-full max-w-full space-y-3 overflow-hidden">
      {periods.map((period) => (
        <div key={period.id} className="w-full max-w-full">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {period.label}
          </h4>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:thin]">
            <div className="inline-flex gap-2 pb-1 pr-1">
              {period.slots.map((slot) => {
                const selected = value === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onChange(slot)}
                    className={`h-10 w-[4.15rem] shrink-0 snap-start border px-2 text-center text-xs font-medium transition-all sm:w-[4.5rem] sm:text-sm ${
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
        </div>
      ))}
    </div>
  );
}
