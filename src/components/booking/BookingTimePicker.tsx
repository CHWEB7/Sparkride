"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";

const QUICK_TIMES = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12}${period}` : `${hour12}:${String(m).padStart(2, "0")}${period}`;
}

type BookingTimePickerProps = {
  value: string;
  onChange: (time: string) => void;
  label?: string;
};

export function BookingTimePicker({ value, onChange, label }: BookingTimePickerProps) {
  const grouped = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    for (const slot of TIME_SLOTS) {
      const hour = parseInt(slot.split(":")[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    }

    return { morning, afternoon, evening };
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-dark p-4 sm:p-5 shadow-sm">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-brand mb-3">{label}</p>
      )}

      <div className="mb-4">
        <p className="text-xs font-medium text-muted mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Popular times
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => onChange(time)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                value === time
                  ? "bg-brand-gradient text-white shadow-sm"
                  : "bg-gray-100 dark:bg-white/5 text-dark dark:text-gray-200 hover:bg-brand-light/60 dark:hover:bg-brand/10"
              }`}
            >
              {formatTimeLabel(time)}
            </button>
          ))}
        </div>
      </div>

      {(
        [
          ["Morning", grouped.morning],
          ["Afternoon", grouped.afternoon],
          ["Evening", grouped.evening],
        ] as const
      ).map(([section, slots]) => (
        <div key={section} className="mb-4 last:mb-0">
          <p className="text-xs font-semibold text-muted mb-2">{section}</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-hide">
            {slots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onChange(time)}
                className={`px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  value === time
                    ? "bg-brand-gradient text-white shadow-sm"
                    : "bg-gray-50 dark:bg-white/5 text-dark dark:text-gray-200 hover:bg-brand-light/60 dark:hover:bg-brand/10"
                }`}
              >
                {formatTimeLabel(time)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
