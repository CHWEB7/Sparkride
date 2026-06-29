import { NextResponse } from "next/server";
import {
  buildBookingCalendarEvents,
  filterCalendarEventsByLeg,
  type BookingCalendarInput,
  type CalendarEventView,
  type CalendarLeg,
} from "./booking-events";
import { buildGoogleCalendarUrl } from "./google-calendar-url";
import { buildIcsCalendar } from "./ics";

export function bookingToCalendarInput(booking: {
  reference: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: Date;
  returnPickupDate?: Date | null;
  journeyType: string;
  serviceType?: string;
  tripType?: string;
  airportName?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  flightNumber?: string | null;
  returnFlightNumber?: string | null;
  passengers?: number;
  luggage?: number;
  vehicleType?: string;
  notes?: string | null;
  driver?: { name: string; vehicleLabel?: string | null } | null;
}): BookingCalendarInput {
  return {
    reference: booking.reference,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDate: booking.pickupDate,
    returnPickupDate: booking.returnPickupDate,
    journeyType: booking.journeyType,
    serviceType: booking.serviceType,
    tripType: booking.tripType,
    airportName: booking.airportName,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    driverName: booking.driver?.name ?? null,
    vehicleLabel: booking.driver?.vehicleLabel,
    flightNumber: booking.flightNumber,
    returnFlightNumber: booking.returnFlightNumber,
    passengers: booking.passengers,
    luggage: booking.luggage,
    vehicleType: booking.vehicleType,
    notes: booking.notes,
  };
}

export function createCalendarResponse(
  booking: BookingCalendarInput,
  view: CalendarEventView,
  leg: CalendarLeg,
  format: "ics" | "google"
): NextResponse {
  const events = filterCalendarEventsByLeg(
    buildBookingCalendarEvents(booking, view),
    leg
  );

  if (events.length === 0) {
    return NextResponse.json({ error: "No calendar event found" }, { status: 404 });
  }

  if (format === "google") {
    return NextResponse.redirect(buildGoogleCalendarUrl(events[0]!));
  }

  const filename =
    leg === "all"
      ? `sparkride-${booking.reference}.ics`
      : `sparkride-${booking.reference}-${leg}.ics`;

  return new NextResponse(buildIcsCalendar(events), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
