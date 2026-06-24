import { endOfYear, format, startOfYear } from "date-fns";

export type DriverStatsBooking = {
  status: string;
  pickupDate: string;
  estimatedPrice: number | null;
  paymentStatus: string;
};

export function getAvailableYears(bookings: DriverStatsBooking[]): number[] {
  const years = new Set(bookings.map((b) => new Date(b.pickupDate).getFullYear()));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

export function computeDriverStats(bookings: DriverStatsBooking[], year: number) {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const now = new Date();

  const inYear = bookings.filter((b) => {
    const date = new Date(b.pickupDate);
    return date >= yearStart && date <= yearEnd;
  });

  const completed = inYear.filter((b) => b.status === "COMPLETED");
  const tripsDone = completed.length;
  const revenue = completed.reduce((sum, b) => sum + (b.estimatedPrice ?? 0), 0);
  const upcoming = inYear.filter(
    (b) =>
      (b.status === "CONFIRMED" || b.status === "ACCEPTED") &&
      new Date(b.pickupDate) >= now
  ).length;

  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthBookings = completed.filter(
      (b) => new Date(b.pickupDate).getMonth() === monthIndex
    );
    return {
      label: format(new Date(year, monthIndex, 1), "MMM"),
      trips: monthBookings.length,
      revenue: monthBookings.reduce((sum, b) => sum + (b.estimatedPrice ?? 0), 0),
    };
  });

  return {
    tripsDone,
    revenue,
    upcoming,
    totalBookings: inYear.length,
    months,
  };
}
