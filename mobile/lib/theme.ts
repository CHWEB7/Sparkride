export const COLORS = {
  brandStart: "#6a68de",
  brandEnd: "#82dbdf",
  bg: "#f9fafc",
  card: "#f0f1f3",
  text: "#191c23",
  muted: "#6b7280",
  white: "#ffffff",
  border: "#e5e7eb",
  success: "#16a34a",
  warning: "#ca8a04",
  danger: "#dc2626",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#fef9c3", text: "#a16207" },
  CONFIRMED: { bg: "#dbeafe", text: "#1d4ed8" },
  PAID: { bg: "#f3e8ff", text: "#7e22ce" },
  COMPLETED: { bg: "#dcfce7", text: "#15803d" },
  CANCELLED: { bg: "#fee2e2", text: "#b91c1c" },
};

export function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

const HUB_SALOON_ESTATE_PRICES: Record<string, { saloon: number; estate?: number }> = {
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

function getHubVehiclePrice(hubCode: string, _vehicleType: string): number | null {
  const tier = HUB_SALOON_ESTATE_PRICES[hubCode];
  if (!tier) return null;
  return tier.estate ? Math.max(tier.saloon, tier.estate) : tier.saloon;
}

export function estimatePrice(
  vehicleType: string,
  tripType: string,
  journeyType: string,
  serviceType: string,
  hubCode?: string | null
): number {
  if (hubCode && serviceType !== "PRE_BOOKED") {
    const oneWay = getHubVehiclePrice(hubCode, vehicleType);
    if (oneWay !== null) {
      if (journeyType === "RETURN") return oneWay * 2;
      return oneWay;
    }
  }

  const prices: Record<string, number> = {
    SALOON: 45,
    ESTATE: 55,
    MPV: 65,
    EXECUTIVE: 85,
  };
  const base = prices[vehicleType] ?? 45;
  if (journeyType === "RETURN") {
    return base * 2;
  }
  return base;
}
