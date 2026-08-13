"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://dmtaxiassistant.com/booking/v1.js";
const OPERATOR_ID = "8bycg38i982l";

/**
 * Inline DM Taxi Assistant booking form.
 * Script must mount in this section (not in a global before-</body> slot)
 * so the form renders where the embed is placed.
 *
 * The provider iframe is max-width 760px by default — keep that natural size
 * and center it; do not stretch it to full page width.
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
    <>
      <style>{`
        [data-booking-embed="dmtaxi"] {
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: 760px;
          margin-left: auto;
          margin-right: auto;
          background: transparent;
        }
        [data-booking-embed="dmtaxi"] iframe {
          display: block !important;
          width: 100% !important;
          max-width: 760px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          border: 0 !important;
          background: transparent !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="w-full max-w-[760px] bg-transparent"
        data-booking-embed="dmtaxi"
      />
    </>
  );
}
