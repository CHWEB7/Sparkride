export type Airport = {
  code: string;
  name: string;
  city: string;
  region: string;
};

export const AIRPORTS: Airport[] = [
  { code: "LBA", name: "Leeds Bradford", city: "Leeds", region: "Yorkshire" },
  { code: "MAN", name: "Manchester", city: "Manchester", region: "North West" },
  { code: "LPL", name: "Liverpool John Lennon", city: "Liverpool", region: "North West" },
  { code: "EMA", name: "East Midlands", city: "Nottingham", region: "East Midlands" },
  { code: "BHX", name: "Birmingham", city: "Birmingham", region: "West Midlands" },
  { code: "LHR", name: "Heathrow", city: "London", region: "London" },
  { code: "LGW", name: "Gatwick", city: "London", region: "London" },
  { code: "STN", name: "Stansted", city: "London", region: "London" },
  { code: "LTN", name: "Luton", city: "London", region: "London" },
  { code: "NCL", name: "Newcastle", city: "Newcastle", region: "North East" },
  { code: "EDI", name: "Edinburgh", city: "Edinburgh", region: "Scotland" },
  { code: "GLA", name: "Glasgow", city: "Glasgow", region: "Scotland" },
];

export function getAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}

export const VEHICLE_PRICES: Record<string, number> = {
  SALOON: 45,
  ESTATE: 55,
  MPV: 65,
  EXECUTIVE: 85,
};

import { usesHubPricing } from "./hubs";

export function estimatePrice(
  vehicleType: string,
  tripType: string,
  journeyType: string = "SINGLE",
  serviceType: string = "AIRPORT_TRANSFER"
): number {
  const base = VEHICLE_PRICES[vehicleType] ?? 45;
  const isHub = usesHubPricing(serviceType);
  const outbound = isHub && tripType === "FROM_AIRPORT" ? base + 5 : base;

  if (journeyType === "RETURN") {
    const inbound = isHub ? base + 5 : base;
    return Math.round((outbound + inbound) * 0.9);
  }

  return outbound;
}
