"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatFare, type FareSection } from "@/lib/hub-pricing";

type FaresTableProps = {
  section: FareSection;
  defaultOpen?: boolean;
};

export function FaresTable({ section, defaultOpen = false }: FaresTableProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();

  return (
    <div className="border-b border-black/8 dark:border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 py-4 sm:py-6 text-left group"
      >
        <div>
          <h2 className="text-lg sm:text-2xl font-semibold tracking-[-0.02em] text-dark dark:text-white group-hover:text-brand dark:group-hover:text-brand-end transition-colors">
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {section.rows.length} destinations
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/8 dark:border-white/10">
              <div className="hidden sm:grid sm:grid-cols-[1fr_7rem_7rem] gap-4 px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted border-b border-black/8 dark:border-white/10">
                <span>Destination</span>
                <span className="text-right">Single</span>
                <span className="text-right">Return</span>
              </div>

              {section.rows.map((row, index) => (
                <div
                  key={row.code}
                  className={[
                    "flex flex-wrap sm:grid sm:grid-cols-[1fr_7rem_7rem] gap-x-4 gap-y-1 items-baseline px-3 sm:px-6 py-3.5 sm:py-5 border-b border-black/8 dark:border-white/10",
                    index === section.rows.length - 1 ? "border-b-0" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="w-full sm:w-auto text-sm sm:text-base font-semibold tracking-[-0.02em] text-dark dark:text-white">
                    {row.name}
                  </span>
                  <span className="text-sm text-muted sm:hidden">Single</span>
                  <span className="text-base font-semibold text-brand sm:text-right">
                    {formatFare(row.single)}
                  </span>
                  <span className="text-sm text-muted sm:hidden">Return</span>
                  <span className="text-base font-semibold text-dark dark:text-white sm:text-right">
                    {formatFare(row.return)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
