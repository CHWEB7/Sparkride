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
  onCancel?: () => void;
};

export function BookingStepBreadcrumb({
  steps,
  currentIndex,
  onBack,
  onGoTo,
  price,
  onCancel,
}: BookingStepBreadcrumbProps) {
  const showBack = currentIndex > 0;
  const showCancel = Boolean(onCancel);

  function handleLeadingAction() {
    if (showBack) onBack();
    else onCancel?.();
  }

  return (
    <div className="shrink-0 border-b border-gray-200/60 dark:border-white/10 px-5 py-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          type="button"
          onClick={handleLeadingAction}
          disabled={!showBack && !showCancel}
          className={`rounded-lg p-1.5 transition-colors ${
            showBack || showCancel
              ? "text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              : "text-transparent pointer-events-none"
          }`}
          aria-label={showBack ? "Go back" : "Cancel booking"}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          {price != null && price > 0 && (
            <p className="text-sm font-semibold text-brand">£{price}</p>
          )}
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium text-muted hover:text-brand transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
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
