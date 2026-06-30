"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const scrollToPage = useCallback((pageIndex: number, behavior: ScrollBehavior = "smooth") => {
    const container = scrollRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(pageIndex, pages.length - 1));
    container.scrollTo({
      left: clamped * container.clientWidth,
      behavior,
    });
    setCurrentPage(clamped);
  }, [pages.length]);

  useEffect(() => {
    if (!scrollRef.current || !activePeriod || !value) return;
    const slotIndex = activePeriod.slots.indexOf(value);
    if (slotIndex < 0) return;
    scrollToPage(Math.floor(slotIndex / SLOTS_PER_PAGE), "smooth");
  }, [value, activePeriod, activePeriodId, scrollToPage]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const syncPageFromScroll = () => {
      const width = container.clientWidth;
      if (width <= 0) return;
      const page = Math.round(container.scrollLeft / width);
      setCurrentPage(Math.max(0, Math.min(page, pages.length - 1)));
    };

    container.addEventListener("scroll", syncPageFromScroll, { passive: true });
    return () => container.removeEventListener("scroll", syncPageFromScroll);
  }, [pages.length, activePeriodId]);

  function handlePeriodChange(periodId: string) {
    setActivePeriodId(periodId);
    setCurrentPage(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }

  if (!activePeriod) return null;

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < pages.length - 1;
  const showPager = pages.length > 1;

  const slotButtonClass = (selected: boolean) =>
    `w-full border px-1 py-2 text-center text-xs font-medium transition-all sm:px-1.5 sm:py-2 sm:text-sm ${
      square ? "rounded-none" : "rounded-lg"
    } ${
      selected
        ? "border-brand bg-brand-light/40 text-brand ring-1 ring-brand/30 dark:bg-brand/10 dark:text-brand-end"
        : "border-gray-200/80 bg-white text-dark hover:border-brand/40 dark:border-white/10 dark:bg-dark dark:text-gray-100"
    }`;

  const arrowButtonClass = (enabled: boolean) =>
    `flex h-full min-h-[5.5rem] w-7 shrink-0 items-center justify-center border transition-colors sm:min-h-[6rem] sm:w-8 ${
      square ? "rounded-none" : "rounded-lg"
    } ${
      enabled
        ? "border-gray-200/80 bg-white text-dark hover:border-brand/40 hover:text-brand dark:border-white/10 dark:bg-dark dark:text-gray-100 dark:hover:text-brand-end"
        : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 dark:border-white/5 dark:bg-white/5 dark:text-gray-600"
    }`;

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div
        className="mb-2 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${periods.length}, minmax(0, 1fr))` }}
      >
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => handlePeriodChange(period.id)}
            className={`min-w-0 truncate px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-colors sm:px-1.5 sm:py-2 sm:text-[11px] ${
              activePeriod.id === period.id
                ? "bg-brand text-white"
                : "border border-gray-300 bg-white text-gray-600 hover:border-brand/40 dark:border-white/15 dark:bg-dark dark:text-gray-300"
            } ${square ? "rounded-none" : "rounded-md"}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 items-stretch gap-1.5">
        {showPager && (
          <button
            type="button"
            aria-label="Earlier times"
            disabled={!canGoPrev}
            onClick={() => scrollToPage(currentPage - 1)}
            className={arrowButtonClass(canGoPrev)}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {pages.map((pageSlots, pageIndex) => (
            <div
              key={`${activePeriod.id}-${pageIndex}`}
              className="grid w-full min-w-full shrink-0 snap-start grid-cols-3 grid-rows-2 gap-1.5 sm:gap-2"
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

        {showPager && (
          <button
            type="button"
            aria-label="Later times"
            disabled={!canGoNext}
            onClick={() => scrollToPage(currentPage + 1)}
            className={arrowButtonClass(canGoNext)}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      {showPager && (
        <p className="mt-2 text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">
          <span className="sm:hidden">Swipe or use the arrows for later times.</span>
          <span className="hidden sm:inline">Use the arrows for later times in {activePeriod.label.toLowerCase()}.</span>
        </p>
      )}
    </div>
  );
}
