"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type BreadcrumbStep = {
  id: string;
  label: string;
};

type BookingStepBreadcrumbProps = {
  steps: BreadcrumbStep[];
  currentIndex: number;
  onBack: () => void;
  onGoTo: (index: number) => void;
  price?: number;
};

export function BookingStepBreadcrumb({
  steps,
  currentIndex,
  onBack,
  onGoTo,
  price,
}: BookingStepBreadcrumbProps) {
  const showBack = currentIndex > 0;

  return (
    <div className="shrink-0 border-b border-gray-200/60 dark:border-white/10 px-5 py-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!showBack}
          className={`rounded-lg p-1.5 transition-colors ${
            showBack
              ? "text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              : "text-transparent pointer-events-none"
          }`}
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {price != null && price > 0 && (
          <p className="text-sm font-semibold text-brand">£{price}</p>
        )}
      </div>

      <nav aria-label="Booking progress" className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;
          const isFuture = index > currentIndex;

          return (
            <span key={step.id} className="inline-flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
              )}
              <button
                type="button"
                disabled={isFuture}
                onClick={() => isComplete && onGoTo(index)}
                className={`transition-colors ${
                  isCurrent
                    ? "font-semibold text-dark dark:text-white"
                    : isComplete
                      ? "text-muted hover:text-brand cursor-pointer"
                      : "text-gray-300 dark:text-gray-600 cursor-default"
                }`}
              >
                {step.label}
              </button>
            </span>
          );
        })}
      </nav>
    </div>
  );
}
