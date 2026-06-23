/** Source prices from West Yorkshire pickup areas (saloon / estate where provided). */
export const HUB_SALOON_ESTATE_PRICES: Record<string, { saloon: number; estate?: number }> = {
  LBA: { saloon: 45, estate: 53 },
  MAN: { saloon: 100, estate: 105 },
  LPL: { saloon: 110 },
  EMA: { saloon: 110 },
  BHX: { saloon: 160 },
  LHR: { saloon: 375 },
  LGW: { saloon: 400 },
  STN: { saloon: 300 },
  LTN: { saloon: 300 },
  NCL: { saloon: 150 },
  HUL: { saloon: 100 },
  DOV: { saloon: 400 },
  SOU: { saloon: 400 },
  DCT: { saloon: 400 },
  LCT: { saloon: 120 },
  PRT: { saloon: 150 },
};

export type FareRow = {
  code: string;
  name: string;
  single: number;
  return: number;
};

export type FareSection = {
  title: string;
  rows: FareRow[];
};

export function isBookableHub(code: string): boolean {
  return code in HUB_SALOON_ESTATE_PRICES;
}

/** Single-trip fixed fare — uses the higher price when two tiers are listed. */
export function getHubSingleTripPrice(hubCode: string): number {
  const tier = HUB_SALOON_ESTATE_PRICES[hubCode];
  if (!tier) return 0;
  return tier.estate ? Math.max(tier.saloon, tier.estate) : tier.saloon;
}

export function getHubReturnTripPrice(hubCode: string): number {
  return getHubSingleTripPrice(hubCode) * 2;
}

export function getHubVehiclePrice(hubCode: string, _vehicleType?: string): number {
  return getHubSingleTripPrice(hubCode);
}

export function estimateHubPrice(
  hubCode: string | null | undefined,
  _vehicleType: string,
  journeyType: string
): number | null {
  if (!hubCode || !isBookableHub(hubCode)) return null;

  const single = getHubSingleTripPrice(hubCode);
  if (journeyType === "RETURN") {
    return getHubReturnTripPrice(hubCode);
  }
  return single;
}

export function formatFare(amount: number): string {
  return `£${amount}`;
}
