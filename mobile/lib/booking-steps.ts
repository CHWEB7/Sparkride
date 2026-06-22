import type { BookingInput } from "./types";

export type StepId =
  | "journey"
  | "service"
  | "direction"
  | "route"
  | "schedule"
  | "contact";

export const STEP_META: Record<StepId, { label: string }> = {
  journey: { label: "Journey" },
  service: { label: "Service" },
  direction: { label: "Direction" },
  route: { label: "Route" },
  schedule: { label: "Schedule" },
  contact: { label: "Details" },
};

export type WizardForm = {
  journeyType: "" | "SINGLE" | "RETURN";
  serviceType: "" | "AIRPORT_TRANSFER" | "PRE_BOOKED";
  tripType: "TO_AIRPORT" | "FROM_AIRPORT";
  airportCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  luggage: number;
  vehicleType: "SALOON" | "ESTATE" | "MPV" | "EXECUTIVE";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightNumber: string;
  returnFlightNumber: string;
  notes: string;
};

export const INITIAL_FORM: WizardForm = {
  journeyType: "",
  serviceType: "",
  tripType: "TO_AIRPORT",
  airportCode: "LBA",
  pickupAddress: "",
  dropoffAddress: "",
  pickupDate: "",
  pickupTime: "",
  returnDate: "",
  returnTime: "",
  passengers: 1,
  luggage: 1,
  vehicleType: "SALOON",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  flightNumber: "",
  returnFlightNumber: "",
  notes: "",
};

export function getSteps(journeyType: string, serviceType: string): StepId[] {
  const steps: StepId[] = ["journey"];
  if (!journeyType) return steps;
  steps.push("service");
  if (!serviceType) return steps;
  if (journeyType === "SINGLE" && serviceType === "AIRPORT_TRANSFER") {
    steps.push("direction");
  }
  steps.push("route", "schedule", "contact");
  return steps;
}

export function validateStep(step: StepId, form: WizardForm): string | null {
  const isReturn = form.journeyType === "RETURN";
  const isAirport = form.serviceType === "AIRPORT_TRANSFER";

  switch (step) {
    case "route":
      if (!form.pickupAddress.trim()) return "Pickup address is required";
      if (!isReturn && !form.dropoffAddress.trim()) return "Drop-off address is required";
      return null;
    case "schedule":
      if (!form.pickupDate || !form.pickupTime) return "Outbound date and time are required";
      if (isReturn && (!form.returnDate || !form.returnTime)) {
        return "Return date and time are required";
      }
      if (isReturn && form.returnDate < form.pickupDate) {
        return "Return date must be on or after outbound date";
      }
      return null;
    case "contact":
      if (!form.customerName.trim()) return "Name is required";
      if (!form.customerPhone.trim()) return "Phone number is required";
      if (!form.customerEmail.trim()) return "Email is required";
      return null;
    default:
      return null;
  }
}

export function toBookingPayload(form: WizardForm): BookingInput {
  const isReturn = form.journeyType === "RETURN";
  const isAirport = form.serviceType === "AIRPORT_TRANSFER";

  return {
    journeyType: form.journeyType as "SINGLE" | "RETURN",
    serviceType: form.serviceType as "AIRPORT_TRANSFER" | "PRE_BOOKED",
    tripType: isReturn && isAirport ? "TO_AIRPORT" : form.tripType,
    airportCode: form.airportCode,
    pickupAddress: form.pickupAddress,
    dropoffAddress: form.dropoffAddress,
    pickupDate: form.pickupDate,
    pickupTime: form.pickupTime,
    returnDate: isReturn ? form.returnDate : undefined,
    returnTime: isReturn ? form.returnTime : undefined,
    passengers: form.passengers,
    luggage: form.luggage,
    vehicleType: form.vehicleType,
    customerName: form.customerName,
    customerEmail: form.customerEmail,
    customerPhone: form.customerPhone,
    flightNumber: form.flightNumber || undefined,
    returnFlightNumber: form.returnFlightNumber || undefined,
    notes: form.notes || undefined,
  };
}
