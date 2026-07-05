import {
  formatHubLabel,
  getDefaultHubCode,
  getHub,
  isHubTransfer,
  PORT_TRANSFER,
} from "@/lib/hubs";

export type WizardStepId =
  | "journey"
  | "service"
  | "direction"
  | "route"
  | "schedule"
  | "driver"
  | "contact";

export const WIZARD_STEP_META: Record<WizardStepId, { label: string }> = {
  journey: { label: "Journey" },
  service: { label: "Service" },
  direction: { label: "Direction" },
  route: { label: "Route" },
  schedule: { label: "Schedule" },
  driver: { label: "Driver" },
  contact: { label: "Details" },
};

export type WizardForm = {
  journeyType: "" | "SINGLE" | "RETURN";
  serviceType:
    | ""
    | "AIRPORT_TRANSFER"
    | "FERRY_PORT_TRANSFER"
    | "CRUISE_TERMINAL_TRANSFER"
    | "PORT_TRANSFER"
    | "PRE_BOOKED";
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
  driverId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightNumber: string;
  returnFlightNumber: string;
  notes: string;
  saveDetails: boolean;
  savedDetailsLabel: string;
  /** Conversation-only flag: party step confirmed */
  stepPartyConfirmed?: boolean;
  /** Conversation-only flag: hub explicitly chosen */
  hubConfirmed?: boolean;
};

export const INITIAL_WIZARD_FORM: WizardForm = {
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
  driverId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  flightNumber: "",
  returnFlightNumber: "",
  notes: "",
  saveDetails: false,
  savedDetailsLabel: "",
};

export function getWizardSteps(journeyType: string, serviceType: string): WizardStepId[] {
  const steps: WizardStepId[] = ["journey"];
  if (!journeyType) return steps;
  steps.push("service");
  if (!serviceType) return steps;
  if (journeyType === "SINGLE" && isHubTransfer(serviceType)) {
    steps.push("direction");
  }
  steps.push("route", "schedule", "driver", "contact");
  return steps;
}

export function validateWizardStep(step: WizardStepId, form: WizardForm): string | null {
  const isReturn = form.journeyType === "RETURN";

  switch (step) {
    case "journey":
      if (!form.journeyType) return "Please choose a journey type";
      return null;
    case "service":
      if (!form.serviceType) return "Please choose a service";
      return null;
    case "direction":
      if (form.journeyType === "SINGLE" && isHubTransfer(form.serviceType) && !form.tripType) {
        return "Please choose a direction";
      }
      return null;
    case "route":
      if (!form.pickupAddress.trim() || form.pickupAddress.trim().length < 3) {
        return "Pickup address is required";
      }
      if (!isReturn && form.serviceType === "PRE_BOOKED") {
        if (!form.dropoffAddress.trim() || form.dropoffAddress.trim().length < 3) {
          return "Drop-off address is required";
        }
      }
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
    case "driver":
      if (!form.driverId) return "Please select a driver";
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

export function getHandoffStepIndex(form: WizardForm): number {
  const steps = getWizardSteps(form.journeyType, form.serviceType);
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step === "driver") return i;
    if (validateWizardStep(step, form)) return i;
  }
  const driverIndex = steps.indexOf("driver");
  return driverIndex >= 0 ? driverIndex : steps.length - 1;
}

export function applyWizardFieldUpdate(
  form: WizardForm,
  field: keyof WizardForm,
  value: string | number | boolean
): WizardForm {
  const next = { ...form, [field]: value } as WizardForm;

  if (field === "journeyType" && value === "RETURN") {
    next.tripType = "TO_AIRPORT";
  }

  if (
    field === "airportCode" ||
    field === "journeyType" ||
    field === "tripType" ||
    field === "serviceType"
  ) {
    if (isHubTransfer(next.serviceType)) {
      const hub = getHub(
        field === "airportCode" ? String(value) : next.airportCode,
        next.serviceType
      );
      if (hub) {
        const hubLabel = formatHubLabel(hub, next.serviceType);
        if (next.journeyType === "RETURN" || next.tripType === "TO_AIRPORT") {
          next.dropoffAddress = hubLabel;
        } else if (next.tripType === "FROM_AIRPORT") {
          next.pickupAddress = hubLabel;
        }
      }
    }
  }

  return next;
}

export function applyServiceSelection(form: WizardForm, serviceType: string): WizardForm {
  const hubCode = getDefaultHubCode(serviceType);
  const hub = getHub(hubCode, serviceType);
  return {
    ...form,
    serviceType: serviceType as WizardForm["serviceType"],
    airportCode: hubCode,
    tripType: "TO_AIRPORT",
    pickupAddress: "",
    dropoffAddress: hub && isHubTransfer(serviceType) ? formatHubLabel(hub, serviceType) : "",
  };
}

export function applyPickupAddress(form: WizardForm, address: string): WizardForm {
  if (!isHubTransfer(form.serviceType)) {
    return { ...form, pickupAddress: address };
  }
  const hub = getHub(form.airportCode, form.serviceType);
  const hubLabel = hub ? formatHubLabel(hub, form.serviceType) : "";
  if (form.journeyType === "RETURN" || form.tripType === "TO_AIRPORT") {
    return { ...form, pickupAddress: address, dropoffAddress: hubLabel };
  }
  return { ...form, pickupAddress: address };
}

export function isHubServiceType(serviceType: string): boolean {
  return isHubTransfer(serviceType) || serviceType === PORT_TRANSFER;
}
