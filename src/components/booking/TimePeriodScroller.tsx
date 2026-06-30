"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TimePeriod } from "@/components/booking/time-slot-groups";
import { formatBookingTimeLabel } from "@/components/booking/time-slot-groups";

const SLOTS_PER_PAGE = 6;

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

function chunkSlots<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function TimePeriodScroller({
  periods,
  value,
  onChange,
  square = false,
}: TimePeriodScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const pages = useMemo(
    () => (activePeriod ? chunkSlots(activePeriod.slots, SLOTS_PER_PAGE) : []),
    [activePeriod]
  );

  useEffect(() => {
    if (!scrollRef.current || !activePeriod || !value) return;
    const slotIndex = activePeriod.slots.indexOf(value);
    if (slotIndex < 0) return;

    const pageIndex = Math.floor(slotIndex / SLOTS_PER_PAGE);
    const container = scrollRef.current;
    container.scrollTo({
      left: pageIndex * container.clientWidth,
      behavior: "smooth",
    });
  }, [value, activePeriod, activePeriodId]);

  function handlePeriodChange(periodId: string) {
    setActivePeriodId(periodId);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }

  if (!activePeriod) return null;

  const slotButtonClass = (selected: boolean) =>
    `w-full border px-2 py-2.5 text-center text-sm font-medium transition-all ${
      square ? "rounded-none" : "rounded-xl"
    } ${
      selected
        ? "border-brand bg-brand-light/40 text-brand ring-1 ring-brand/30 dark:bg-brand/10 dark:text-brand-end"
        : "border-gray-200/80 bg-white text-dark hover:border-brand/40 dark:border-white/10 dark:bg-dark dark:text-gray-100"
    }`;

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="mb-3 flex flex-wrap gap-2">
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => handlePeriodChange(period.id)}
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

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((pageSlots, pageIndex) => (
          <div
            key={`${activePeriod.id}-${pageIndex}`}
            className="grid w-full min-w-full shrink-0 snap-start grid-cols-3 grid-rows-2 gap-2"
          >
            {pageSlots.map((slot) => {
              const selected = value === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onChange(slot)}
                  className={slotButtonClass(selected)}
                >
                  {formatBookingTimeLabel(slot)}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {pages.length > 1 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Swipe right for later times in {activePeriod.label.toLowerCase()}.
        </p>
      )}
    </div>
  );
}
