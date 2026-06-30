"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type BookingAccordionSectionProps = {
  id: string;
  step: number;
  title: string;
  subtitle?: string;
  open: boolean;
  unlocked: boolean;
  complete: boolean;
  onToggle: () => void;
  scrollIntoView?: boolean;
  children: ReactNode;
};

export function BookingAccordionSection({
  id,
  step,
  title,
  subtitle,
  open,
  unlocked,
  complete,
  onToggle,
  scrollIntoView = false,
  children,
}: BookingAccordionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open && scrollIntoView && sectionRef.current) {
      const timer = window.setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => window.clearTimeout(timer);
    }
  }, [open, scrollIntoView]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`border border-gray-300 bg-white dark:border-white/15 dark:bg-dark-elevated ${
        !unlocked ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        disabled={!unlocked}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="flex w-full items-center gap-4 border-b border-gray-200 bg-[#f3f4f6] px-4 py-4 text-left transition-colors disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 sm:px-5"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center text-sm font-bold ${
            complete
              ? "bg-brand text-white"
              : "border border-gray-300 bg-white text-gray-700 dark:border-white/20 dark:bg-dark dark:text-gray-200"
          }`}
        >
          {step}
        </span>

        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-gray-900 dark:text-white">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
          )}
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && unlocked && (
        <div id={`${id}-panel`} className="px-4 py-5 sm:px-5 sm:py-6">
          {children}
        </div>
      )}
    </section>
  );
}
