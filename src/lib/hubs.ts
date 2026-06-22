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

export const SERVICE_TYPES = [
  ...HUB_SERVICE_TYPES,
  "PRE_BOOKED",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export function isHubTransfer(serviceType: string): serviceType is HubServiceType {
  return HUB_SERVICE_TYPES.includes(serviceType as HubServiceType);
}

export function getHubList(serviceType: string): TransferHub[] {
  switch (serviceType) {
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
  switch (serviceType) {
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
  switch (serviceType) {
    case "FERRY_PORT_TRANSFER":
      return [
        { value: "TO_AIRPORT", label: "To ferry port", desc: "Home or hotel → ferry port" },
        { value: "FROM_AIRPORT", label: "From ferry port", desc: "Ferry port → your destination" },
      ];
    case "CRUISE_TERMINAL_TRANSFER":
      return [
        { value: "TO_AIRPORT", label: "To cruise terminal", desc: "Home or hotel → cruise terminal" },
        { value: "FROM_AIRPORT", label: "From cruise terminal", desc: "Cruise terminal → your destination" },
      ];
    default:
      return [
        { value: "TO_AIRPORT", label: "To airport", desc: "Home or hotel → airport" },
        { value: "FROM_AIRPORT", label: "From airport", desc: "Airport → your destination" },
      ];
  }
}

export function usesHubPricing(serviceType: string): boolean {
  return isHubTransfer(serviceType);
}
