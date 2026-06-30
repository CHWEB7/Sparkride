"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [activePeriodId, setActivePeriodId] = useState(
    () => findPeriodForTime(periods, value) ?? periods[0]?.id ?? ""
  );
  const [currentPage, setCurrentPage] = useState(0);

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

  const visibleSlots = pages[currentPage] ?? [];

  useEffect(() => {
    if (!activePeriod || !value) return;
    const slotIndex = activePeriod.slots.indexOf(value);
    if (slotIndex < 0) return;
    setCurrentPage(Math.floor(slotIndex / SLOTS_PER_PAGE));
  }, [value, activePeriod, activePeriodId]);

  function handlePeriodChange(periodId: string) {
    setActivePeriodId(periodId);
    setCurrentPage(0);
  }

  if (!activePeriod) return null;

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < pages.length - 1;
  const showPager = pages.length > 1;

  const slotButtonClass = (selected: boolean) =>
    `w-full border px-1 py-2 text-center text-xs font-medium transition-all sm:px-1.5 sm:text-sm ${
      square ? "rounded-none" : "rounded-lg"
    } ${
      selected
        ? "border-brand bg-brand-light/40 text-brand ring-1 ring-brand/30 dark:bg-brand/10 dark:text-brand-end"
        : "border-gray-200/80 bg-white text-dark hover:border-brand/40 dark:border-white/10 dark:bg-dark dark:text-gray-100"
    }`;

  const arrowButtonClass = (enabled: boolean) =>
    `flex w-7 shrink-0 items-center justify-center self-center border transition-colors sm:w-8 ${
      square ? "rounded-none" : "rounded-lg"
    } ${
      enabled
        ? "h-[4.75rem] border-gray-200/80 bg-white text-dark hover:border-brand/40 hover:text-brand dark:border-white/10 dark:bg-dark dark:text-gray-100 dark:hover:text-brand-end sm:h-[5.25rem]"
        : "h-[4.75rem] cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 dark:border-white/5 dark:bg-white/5 dark:text-gray-600 sm:h-[5.25rem]"
    }`;

  return (
    <div className="min-w-0 max-w-full">
      <div
        className="mb-2 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${periods.length}, minmax(0, 1fr))` }}
      >
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => handlePeriodChange(period.id)}
            className={`min-w-0 truncate px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-colors sm:py-2 sm:text-[11px] ${
              activePeriod.id === period.id
                ? "bg-brand text-white"
                : "border border-gray-300 bg-white text-gray-600 hover:border-brand/40 dark:border-white/15 dark:bg-dark dark:text-gray-300"
            } ${square ? "rounded-none" : "rounded-md"}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 items-center gap-1.5">
        {showPager && (
          <button
            type="button"
            aria-label="Earlier times"
            disabled={!canGoPrev}
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
            className={arrowButtonClass(canGoPrev)}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}

        <div className="grid min-w-0 flex-1 grid-cols-3 grid-rows-2 gap-1.5 sm:gap-2">
          {visibleSlots.map((slot) => {
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

        {showPager && (
          <button
            type="button"
            aria-label="Later times"
            disabled={!canGoNext}
            onClick={() => setCurrentPage((page) => Math.min(pages.length - 1, page + 1))}
            className={arrowButtonClass(canGoNext)}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      {showPager && (
        <p className="mt-2 text-center text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">
          Page {currentPage + 1} of {pages.length} · {activePeriod.label}
        </p>
      )}
    </div>
  );
}
