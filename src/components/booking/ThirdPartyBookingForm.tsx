"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://dmtaxiassistant.com/booking/v1.js";
const OPERATOR_ID = "8bycg38i982l";

type ThirdPartyBookingFormProps = {
  className?: string;
};

/**
 * Inline DM Taxi Assistant booking form.
 * Script must mount in this section (not in a global before-</body> slot)
 * so the form renders where the embed is placed.
 */
export function ThirdPartyBookingForm({ className = "" }: ThirdPartyBookingFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const existing = container.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.operator = OPERATOR_ID;
    container.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 1023px) {
          [data-booking-embed="dmtaxi"] iframe,
          [data-booking-embed="dmtaxi"] > div:not(style) {
            width: 100% !important;
            min-height: calc(100dvh - 8.75rem) !important;
          }
        }
      `}</style>
      <div
        ref={containerRef}
        className={`w-full rounded-2xl border border-black/8 bg-white shadow-sm dark:border-white/10 dark:bg-dark-elevated max-lg:min-h-[calc(100dvh-8.75rem)] max-lg:overflow-visible lg:h-full lg:min-h-0 lg:overflow-hidden ${className}`}
        data-booking-embed="dmtaxi"
      />
    </>
  );
}
