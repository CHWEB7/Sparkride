import { CalendarDays } from "lucide-react";
import { BookingCalendarActions } from "./BookingCalendarActions";

type AddToCalendarSectionProps = {
  reference: string;
  hasReturn: boolean;
};

export function AddToCalendarSection({ reference, hasReturn }: AddToCalendarSectionProps) {
  return (
    <section className="mb-6 rounded-3xl border border-brand/20 bg-brand/5 p-6 dark:bg-brand/10">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15">
          <CalendarDays className="h-5 w-5 text-brand" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Add to your calendar</h2>
          <p className="mt-1 text-sm text-muted">
            Save this trip to Google Calendar, Apple Calendar, or Outlook so you do not miss pickup
            time.
          </p>
          <div className="mt-4">
            <BookingCalendarActions
              reference={reference}
              hasReturn={hasReturn}
              apiBase="/api/bookings"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
