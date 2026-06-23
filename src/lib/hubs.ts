import { AIRPORTS, getAirport } from "./airports";
import { CRUISE_TERMINALS, getCruiseTerminal } from "./cruise-terminals";
import { FERRY_PORTS, getFerryPort } from "./ferry-ports";

export type TransferHub = {
  code: string;
  name: string;
  city: string;
  region: string;
};

export const HUB_SERVICE_TYPES = [
  "AIRPORT_TRANSFER",
  "FERRY_PORT_TRANSFER",
  "CRUISE_TERMINAL_TRANSFER",
] as const;

export type HubServiceType = (typeof HUB_SERVICE_TYPES)[number];

/** Combined ferry + cruise category in the booking UI. */
export const PORT_TRANSFER = "PORT_TRANSFER" as const;

export type BookingHubServiceType = HubServiceType | typeof PORT_TRANSFER;

export const SERVICE_TYPES = [...HUB_SERVICE_TYPES, PORT_TRANSFER, "PRE_BOOKED"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export function isPortTransferCategory(serviceType: string): boolean {
  return (
    serviceType === PORT_TRANSFER ||
    serviceType === "FERRY_PORT_TRANSFER" ||
    serviceType === "CRUISE_TERMINAL_TRANSFER"
  );
}

export function isHubTransfer(serviceType: string): serviceType is BookingHubServiceType {
  return (
    serviceType === PORT_TRANSFER || HUB_SERVICE_TYPES.includes(serviceType as HubServiceType)
  );
}

export function resolveStoredServiceType(hubCode: string): HubServiceType {
  if (getFerryPort(hubCode)) return "FERRY_PORT_TRANSFER";
  if (getCruiseTerminal(hubCode)) return "CRUISE_TERMINAL_TRANSFER";
  return "AIRPORT_TRANSFER";
}

export function normalizeServiceType(
  serviceType: string,
  hubCode?: string | null
): HubServiceType | "PRE_BOOKED" {
  if (serviceType === PORT_TRANSFER && hubCode) {
    return resolveStoredServiceType(hubCode);
  }
  if (serviceType === "PRE_BOOKED") return "PRE_BOOKED";
  return serviceType as HubServiceType;
}

export function getCombinedPorts(): TransferHub[] {
  return [...FERRY_PORTS, ...CRUISE_TERMINALS];
}

export function getHubList(serviceType: string): TransferHub[] {
  switch (serviceType) {
    case PORT_TRANSFER:
      return getCombinedPorts();
    case "FERRY_PORT_TRANSFER":
      return FERRY_PORTS;
    case "CRUISE_TERMINAL_TRANSFER":
      return CRUISE_TERMINALS;
    case "AIRPORT_TRANSFER":
      return AIRPORTS;
    default:
      return [];
  }
}

export function getHub(code: string, serviceType: string): TransferHub | undefined {
  if (serviceType === PORT_TRANSFER) {
    return getFerryPort(code) ?? getCruiseTerminal(code);
  }

  switch (serviceType) {
    case "FERRY_PORT_TRANSFER":
      return getFerryPort(code);
    case "CRUISE_TERMINAL_TRANSFER":
      return getCruiseTerminal(code);
    case "AIRPORT_TRANSFER":
      return getAirport(code);
    default:
      return undefined;
  }
}

export function formatHubLabel(hub: TransferHub, serviceType: string): string {
  const resolved =
    serviceType === PORT_TRANSFER ? resolveStoredServiceType(hub.code) : serviceType;

  switch (resolved) {
    case "AIRPORT_TRANSFER":
      return `${hub.name} Airport (${hub.code})`;
    case "FERRY_PORT_TRANSFER":
      return `${hub.name} Ferry Port (${hub.code})`;
    case "CRUISE_TERMINAL_TRANSFER":
      return `${hub.name} (${hub.code})`;
    default:
      return `${hub.name} (${hub.code})`;
  }
}

export function getDefaultHubCode(serviceType: string): string {
  switch (serviceType) {
    case PORT_TRANSFER:
      return FERRY_PORTS[0]?.code ?? CRUISE_TERMINALS[0]?.code ?? "HUL";
    case "FERRY_PORT_TRANSFER":
      return "HUL";
    case "CRUISE_TERMINAL_TRANSFER":
      return "SOU";
    case "AIRPORT_TRANSFER":
      return "LBA";
    default:
      return "LBA";
  }
}

export function getServiceLabel(serviceType: string): string {
  switch (serviceType) {
    case "AIRPORT_TRANSFER":
      return "Airport transfer";
    case PORT_TRANSFER:
      return "Ferry & cruise port transfer";
    case "FERRY_PORT_TRANSFER":
      return "Ferry port transfer";
    case "CRUISE_TERMINAL_TRANSFER":
      return "Cruise terminal transfer";
    case "PRE_BOOKED":
      return "Pre-booked journey";
    default:
      return "Transfer";
  }
}

export function getHubPickerLabel(serviceType: string): string {
  switch (serviceType) {
    case PORT_TRANSFER:
      return "Port";
    case "FERRY_PORT_TRANSFER":
      return "Ferry port";
    case "CRUISE_TERMINAL_TRANSFER":
      return "Cruise terminal";
    case "AIRPORT_TRANSFER":
      return "Airport";
    default:
      return "Destination";
  }
}

export function getDirectionOptions(serviceType: string) {
  if (isPortTransferCategory(serviceType)) {
    return [
      { value: "TO_AIRPORT", label: "To port", desc: "Home or hotel → ferry or cruise port" },
      { value: "FROM_AIRPORT", label: "From port", desc: "Port → your destination" },
    ];
  }

  return [
    { value: "TO_AIRPORT", label: "To airport", desc: "Home or hotel → airport" },
    { value: "FROM_AIRPORT", label: "From airport", desc: "Airport → your destination" },
  ];
}

export function usesHubPricing(serviceType: string): boolean {
  return isHubTransfer(serviceType);
}
