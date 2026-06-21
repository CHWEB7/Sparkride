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
  EN_ROUTE: { bg: "#f3e8ff", text: "#7e22ce" },
  COMPLETED: { bg: "#dcfce7", text: "#15803d" },
  CANCELLED: { bg: "#fee2e2", text: "#b91c1c" },
};

export function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function estimatePrice(
  vehicleType: string,
  tripType: string,
  journeyType: string,
  serviceType: string
): number {
  const prices: Record<string, number> = {
    SALOON: 45,
    ESTATE: 55,
    MPV: 65,
    EXECUTIVE: 85,
  };
  const base = prices[vehicleType] ?? 45;
  const isAirport = serviceType === "AIRPORT_TRANSFER";
  const outbound = isAirport && tripType === "FROM_AIRPORT" ? base + 5 : base;

  if (journeyType === "RETURN") {
    const inbound = isAirport ? base + 5 : base;
    return Math.round((outbound + inbound) * 0.9);
  }
  return outbound;
}
