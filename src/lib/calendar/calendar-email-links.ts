import { getSiteUrl } from "@/lib/site-url";
import {
  buildBookingCalendarEvents,
  type BookingCalendarInput,
} from "./booking-events";
import { createCalendarDownloadToken } from "./calendar-tokens";
import { buildGoogleCalendarUrl } from "./google-calendar-url";

export type CustomerCalendarEmailLinks = {
  googleOutbound: string | null;
  googleReturn: string | null;
  icsAll: string;
  icsOutbound: string;
  icsReturn: string | null;
};

export async function buildCustomerCalendarEmailLinks(
  booking: BookingCalendarInput
): Promise<CustomerCalendarEmailLinks> {
  const siteUrl = getSiteUrl();
  const events = buildBookingCalendarEvents(booking, "customer");
  const outbound = events.find((event) => event.leg === "outbound") ?? null;
  const returnEvent = events.find((event) => event.leg === "return") ?? null;

  const [allToken, outboundToken, returnToken] = await Promise.all([
    createCalendarDownloadToken(booking.reference, "all"),
    createCalendarDownloadToken(booking.reference, "outbound"),
    returnEvent
      ? createCalendarDownloadToken(booking.reference, "return")
      : Promise.resolve(null),
  ]);

  return {
    googleOutbound: outbound ? buildGoogleCalendarUrl(outbound) : null,
    googleReturn: returnEvent ? buildGoogleCalendarUrl(returnEvent) : null,
    icsAll: `${siteUrl}/api/calendar/${allToken}`,
    icsOutbound: `${siteUrl}/api/calendar/${outboundToken}`,
    icsReturn: returnToken ? `${siteUrl}/api/calendar/${returnToken}` : null,
  };
}
