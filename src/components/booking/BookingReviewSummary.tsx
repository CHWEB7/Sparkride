import { formatBookingTimeLabel } from "@/components/booking/time-slot-groups";
import { getAirportTerminalLabel } from "@/lib/airport-terminals";
import {
  getDirectionOptions,
  getHub,
  getHubPickerLabel,
  getServiceLabel,
  isHubTransfer,
} from "@/lib/hubs";

export type BookingReviewForm = {
  journeyType: string;
  serviceType: string;
  tripType: string;
  airportCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  luggage: number;
  driverName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightNumber: string;
  flightDepartureTime: string;
  flightTerminal: string;
  returnFlightNumber: string;
  returnFlightDepartureTime: string;
  returnFlightTerminal: string;
  notes: string;
  estimatedPrice: number;
};

function formatDateLabel(dateKey: string): string {
  if (!dateKey) return "";
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildBookingReviewSections(
  form: BookingReviewForm,
  options: { isAirportTransfer: boolean; driverName?: string }
): Array<{ title: string; lines: string[] }> {
  const isReturn = form.journeyType === "RETURN";
  const hub = isHubTransfer(form.serviceType) ? getHub(form.airportCode, form.serviceType) : null;
  const direction = getDirectionOptions(form.serviceType).find((o) => o.value === form.tripType)?.label;

  const sections: Array<{ title: string; lines: string[] }> = [
    {
      title: "Trip",
      lines: [
        `Journey: ${form.journeyType === "RETURN" ? "Return" : "Single"}`,
        `Service: ${getServiceLabel(form.serviceType)}`,
        ...(direction ? [`Direction: ${direction}`] : []),
        ...(hub ? [`${getHubPickerLabel(form.serviceType)}: ${hub.name} (${hub.code})`] : []),
      ],
    },
    {
      title: "Route",
      lines: [
        `Pickup: ${form.pickupAddress}`,
        ...(isReturn && isHubTransfer(form.serviceType)
          ? [`Return route: ${hub?.name ?? "Airport"} ↔ home`]
          : [`Drop-off: ${form.dropoffAddress}`]),
      ],
    },
    {
      title: "Pickup schedule",
      lines: [
        `Outbound pickup: ${formatDateLabel(form.pickupDate)} at ${formatBookingTimeLabel(form.pickupTime)}`,
        ...(isReturn
          ? [
              `Return pickup: ${formatDateLabel(form.returnDate)} at ${formatBookingTimeLabel(form.returnTime)}`,
            ]
          : []),
      ],
    },
    {
      title: "Passengers",
      lines: [
        `${form.passengers} passenger${form.passengers === 1 ? "" : "s"}`,
        `${form.luggage} piece${form.luggage === 1 ? "" : "s"} of luggage`,
      ],
    },
  ];

  if (options.isAirportTransfer) {
    const flightLines = [
      ...(form.flightNumber.trim() ? [`Outbound flight: ${form.flightNumber}`] : []),
      `Departure: ${formatBookingTimeLabel(form.flightDepartureTime)}`,
      `Terminal: ${getAirportTerminalLabel(form.airportCode, form.flightTerminal)}`,
      ...(isReturn
        ? [
            ...(form.returnFlightNumber.trim()
              ? [`Return flight: ${form.returnFlightNumber}`]
              : []),
            `Return departure: ${formatBookingTimeLabel(form.returnFlightDepartureTime)}`,
            `Return terminal: ${getAirportTerminalLabel(form.airportCode, form.returnFlightTerminal)}`,
          ]
        : []),
    ];

    sections.push({
      title: "Flight information",
      lines: flightLines,
    });
  }

  sections.push(
    {
      title: "Driver",
      lines: [options.driverName ?? "Selected driver"],
    },
    {
      title: "Your details",
      lines: [
        form.customerName,
        form.customerEmail,
        form.customerPhone,
        ...(form.notes ? [`Notes: ${form.notes}`] : []),
      ],
    },
    {
      title: "Fare",
      lines: [`Estimated total: £${form.estimatedPrice}`],
    }
  );

  return sections;
}
