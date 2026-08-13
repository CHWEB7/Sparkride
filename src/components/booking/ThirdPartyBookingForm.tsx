"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://dmtaxiassistant.com/booking/v1.js";
const OPERATOR_ID = "8bycg38i982l";

/**
 * Inline DM Taxi Assistant booking form.
 * Script must mount in this section (not in a global before-</body> slot)
 * so the form renders where the embed is placed.
 */
export function ThirdPartyBookingForm() {
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
    <div
      ref={containerRef}
      className="w-full min-h-[560px] overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm dark:border-white/10 dark:bg-dark-elevated sm:min-h-[640px]"
      data-booking-embed="dmtaxi"
    />
  );
}
