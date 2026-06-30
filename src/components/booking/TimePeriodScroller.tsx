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
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="max-h-64 overflow-y-auto pr-1 sm:max-h-72">
        <div className="space-y-4">
          {periods.map((period) => (
            <div key={period.id}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {period.label}
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {period.slots.map((slot) => {
                  const selected = value === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => onChange(slot)}
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
  );
}
