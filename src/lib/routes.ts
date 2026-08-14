import { AIRPORTS } from "./airports";
import { getHubReturnTripPrice, getHubSingleTripPrice } from "./hub-pricing";
import { SERVICE_AREA } from "./service-area";

export type RouteDefinition = {
  slug: string;
  pickupSlug: string;
  pickupName: string;
  airportCode: string;
  airportName: string;
  singlePrice: number;
  returnPrice: number;
  journeyTime: string;
};

const TOP_AIRPORT_CODES = ["LBA", "MAN", "LHR", "LGW", "BHX", "NCL", "LPL", "EMA", "STN", "LTN"] as const;

const JOURNEY_TIMES: Record<string, string> = {
  LBA: "35–50 minutes",
  MAN: "1 hour 15–1 hour 30",
  LHR: "3 hours 30–4 hours",
  LGW: "3 hours 45–4 hours 15",
  BHX: "2 hours–2 hours 15",
  NCL: "1 hour 45–2 hours",
  LPL: "1 hour 30–1 hour 45",
  EMA: "1 hour 45–2 hours",
  STN: "3 hours 15–3 hours 45",
  LTN: "3 hours–3 hours 30",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getRouteSlug(pickupName: string, airportName: string): string {
  return `${slugify(pickupName)}-to-${slugify(airportName)}-airport`;
}

function buildRoute(pickupSlug: string, pickupName: string, airportCode: string): RouteDefinition {
  const airport = AIRPORTS.find((item) => item.code === airportCode);
  if (!airport) {
    throw new Error(`Unknown airport code: ${airportCode}`);
  }

  return {
    slug: getRouteSlug(pickupName, airport.name),
    pickupSlug,
    pickupName,
    airportCode,
    airportName: airport.name,
    singlePrice: getHubSingleTripPrice(airportCode),
    returnPrice: getHubReturnTripPrice(airportCode),
    journeyTime: JOURNEY_TIMES[airportCode] ?? "Varies by traffic",
  };
}

export const CASTLEFORD_ROUTES: RouteDefinition[] = TOP_AIRPORT_CODES.map((code) =>
  buildRoute("castleford", SERVICE_AREA.hub, code)
);

export function getRouteBySlug(slug: string): RouteDefinition | undefined {
  return CASTLEFORD_ROUTES.find((route) => route.slug === slug);
}

export function getAllRouteSlugs(): string[] {
  return CASTLEFORD_ROUTES.map((route) => route.slug);
}
