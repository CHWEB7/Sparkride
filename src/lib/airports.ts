import { isBookableHub, estimateHubPrice } from "./hub-pricing";

export type Airport = {
  code: string;
  name: string;
  city: string;
  region: string;
};

const ALL_AIRPORTS: Airport[] = [
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
];

export const AIRPORTS = ALL_AIRPORTS.filter((airport) => isBookableHub(airport.code));

export function getAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}

/** Fallback vehicle tiers for pre-booked journeys without a fixed hub price. */
export const VEHICLE_PRICES: Record<string, number> = {
  SALOON: 45,
  ESTATE: 55,
  MPV: 65,
  EXECUTIVE: 85,
};

export function estimatePrice(
  vehicleType: string,
  tripType: string,
  journeyType: string = "SINGLE",
  serviceType: string = "AIRPORT_TRANSFER",
  hubCode?: string | null
): number {
  if (hubCode && serviceType !== "PRE_BOOKED") {
    const hubPrice = estimateHubPrice(hubCode, vehicleType, journeyType);
    if (hubPrice !== null) return hubPrice;
  }

  const base = VEHICLE_PRICES[vehicleType] ?? 45;
  if (journeyType === "RETURN") {
    return base * 2;
  }
  return base;
}
