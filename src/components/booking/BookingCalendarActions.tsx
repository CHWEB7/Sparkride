import { CalendarPlus, Download } from "lucide-react";
import type { CalendarLeg } from "@/lib/calendar/booking-events";

type BookingCalendarActionsProps = {
  reference: string;
  hasReturn: boolean;
  apiBase: "/api/bookings" | "/api/driver/bookings";
  leg?: CalendarLeg;
  compact?: boolean;
};

function calendarUrl(
  apiBase: BookingCalendarActionsProps["apiBase"],
  reference: string,
  format: "google" | "ics",
  leg: CalendarLeg
): string {
  const params = new URLSearchParams({ format, leg });
  return `${apiBase}/${encodeURIComponent(reference)}/calendar?${params.toString()}`;
}

export function BookingCalendarActions({
  reference,
  hasReturn,
  apiBase,
  leg = "all",
  compact = false,
}: BookingCalendarActionsProps) {
  const googleLeg: CalendarLeg = leg === "all" ? "outbound" : leg;
  const googleHref = calendarUrl(apiBase, reference, "google", googleLeg);
  const icsHref = calendarUrl(apiBase, reference, "ics", leg);

  const buttonClass = compact
    ? "inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/10 transition-colors"
    : "inline-flex items-center justify-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/10 transition-colors";

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "flex flex-col gap-2 sm:flex-row sm:flex-wrap"}>
      <a href={googleHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <CalendarPlus className="h-4 w-4" />
        {hasReturn && leg === "all" ? "Google Calendar (outbound)" : "Add to Google Calendar"}
      </a>

      {hasReturn && leg === "all" && (
        <a
          href={calendarUrl(apiBase, reference, "google", "return")}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          <CalendarPlus className="h-4 w-4" />
          Google Calendar (return)
        </a>
      )}

      <a href={icsHref} className={buttonClass}>
        <Download className="h-4 w-4" />
        {hasReturn && leg !== "outbound" && leg !== "return"
          ? "Download .ics (all legs)"
          : "Download .ics"}
      </a>

      {hasReturn && leg === "all" && (
        <>
          <a
            href={calendarUrl(apiBase, reference, "ics", "outbound")}
            className={buttonClass}
          >
            <Download className="h-4 w-4" />
            Download .ics (outbound)
          </a>
          <a
            href={calendarUrl(apiBase, reference, "ics", "return")}
            className={buttonClass}
          >
            <Download className="h-4 w-4" />
            Download .ics (return)
          </a>
        </>
      )}
    </div>
  );
}
