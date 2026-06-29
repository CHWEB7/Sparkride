import { getSiteUrl } from "@/lib/site-url";
import { getServiceLabel } from "@/lib/hubs";

export type CalendarLeg = "outbound" | "return" | "all";

export type CalendarEventView = "customer" | "driver";

export type BookingCalendarInput = {
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
  driverName?: string | null;
  vehicleLabel?: string | null;
  flightNumber?: string | null;
  returnFlightNumber?: string | null;
  passengers?: number;
  luggage?: number;
  vehicleType?: string;
  notes?: string | null;
};

export type CalendarEvent = {
  leg: "outbound" | "return";
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
};

const UK_TZ = "Europe/London";
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

export function isCustomerCalendarEligible(
  status: string,
  paymentStatus: string
): boolean {
  return status === "CONFIRMED" || paymentStatus === "PAID";
}

function tripLabel(input: BookingCalendarInput): string {
  if (input.serviceType) {
    return getServiceLabel(input.serviceType);
  }
  return "Transfer";
}

function formatLondonDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: UK_TZ,
  });
}

function buildDescription(
  input: BookingCalendarInput,
  view: CalendarEventView,
  leg: "outbound" | "return"
): string {
  const lines: string[] = [
    `Sparkride booking ${input.reference}`,
    "",
    leg === "return" ? "Return leg" : "Outbound leg",
    `Pickup: ${input.pickupAddress}`,
    `Drop-off: ${input.dropoffAddress}`,
  ];

  if (view === "customer" && input.driverName) {
    lines.push(`Driver: ${input.driverName}${input.vehicleLabel ? ` · ${input.vehicleLabel}` : ""}`);
  }

  if (view === "driver") {
    lines.push(`Customer: ${input.customerName}`);
    if (input.customerPhone) lines.push(`Phone: ${input.customerPhone}`);
    if (input.customerEmail) lines.push(`Email: ${input.customerEmail}`);
  }

  if (input.flightNumber && leg === "outbound") {
    lines.push(`Flight: ${input.flightNumber}`);
  }
  if (input.returnFlightNumber && leg === "return") {
    lines.push(`Return flight: ${input.returnFlightNumber}`);
  }

  if (input.passengers != null) {
    lines.push(`Passengers: ${input.passengers} · Bags: ${input.luggage ?? 0}`);
  }

  if (input.notes) {
    lines.push(`Notes: ${input.notes}`);
  }

  lines.push("", `View booking: ${getSiteUrl()}/booking/${input.reference}`);

  return lines.join("\n");
}

function buildEventTitle(
  input: BookingCalendarInput,
  view: CalendarEventView,
  leg: "outbound" | "return"
): string {
  const service = tripLabel(input);
  const legSuffix = leg === "return" ? " — Return" : "";

  if (view === "driver") {
    return `Sparkride ${input.reference}${legSuffix} — ${input.customerName}`;
  }

  return `Sparkride ${service}${legSuffix} (${input.reference})`;
}

function createEvent(
  input: BookingCalendarInput,
  view: CalendarEventView,
  leg: "outbound" | "return",
  start: Date,
  pickupAddress: string
): CalendarEvent {
  return {
    leg,
    uid: `sparkride-${input.reference}-${leg}@sparkride.co.uk`,
    title: buildEventTitle(input, view, leg),
    start,
    end: new Date(start.getTime() + DEFAULT_DURATION_MS),
    location: pickupAddress,
    description: buildDescription(input, view, leg),
  };
}

export function buildBookingCalendarEvents(
  input: BookingCalendarInput,
  view: CalendarEventView
): CalendarEvent[] {
  const events: CalendarEvent[] = [
    createEvent(input, view, "outbound", input.pickupDate, input.pickupAddress),
  ];

  if (input.journeyType === "RETURN" && input.returnPickupDate) {
    events.push(
      createEvent(
        input,
        view,
        "return",
        input.returnPickupDate,
        input.dropoffAddress
      )
    );
  }

  return events;
}

export function filterCalendarEventsByLeg(
  events: CalendarEvent[],
  leg: CalendarLeg
): CalendarEvent[] {
  if (leg === "all") return events;
  return events.filter((event) => event.leg === leg);
}

export function formatCalendarEventDateRange(event: CalendarEvent): string {
  return formatLondonDateTime(event.start);
}
