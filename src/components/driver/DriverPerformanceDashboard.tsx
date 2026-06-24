"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, PoundSterling, TrendingUp } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import {
  computeDriverStats,
  getAvailableYears,
  type DriverStatsBooking,
} from "@/lib/driver-dashboard-stats";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DriverPerformanceDashboard({
  bookings,
  scopeLabel,
}: {
  bookings: DriverStatsBooking[];
  scopeLabel: string;
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const years = useMemo(() => getAvailableYears(bookings), [bookings]);
  const [year, setYear] = useState(years[0] ?? new Date().getFullYear());

  const stats = useMemo(() => computeDriverStats(bookings, year), [bookings, year]);
  const maxRevenue = Math.max(...stats.months.map((m) => m.revenue), 1);

  const cardClass = isLight
    ? "rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    : "rounded-xl border border-white/10 bg-dark-elevated p-5";
  const panelClass = isLight
    ? "rounded-xl border border-gray-200 bg-white shadow-sm"
    : "rounded-xl border border-white/10 bg-dark-elevated";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{scopeLabel}</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Performance</p>
        <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Year</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={`rounded-lg border px-3 py-1.5 text-sm outline-none ${
              isLight
                ? "border-gray-200 bg-white text-gray-900"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid shrink-0 gap-4 sm:grid-cols-3">
        <div className={cardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Trips completed</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {stats.tripsDone}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-brand-end">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {stats.totalBookings} total bookings in {year}
          </p>
        </div>

        <div className={cardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue earned</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {formatCurrency(stats.revenue)}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-brand-end">
              <PoundSterling className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            From completed trips in {year}
          </p>
        </div>

        <div className={cardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming trips</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {stats.upcoming}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-brand-end">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Accepted or confirmed, still to run
          </p>
        </div>
      </div>

      <div className={`flex min-h-0 flex-1 flex-col ${panelClass}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Monthly revenue</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Busy periods across {year}
            </p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {format(new Date(year, 0, 1), "d MMM yyyy")} – {format(new Date(year, 11, 31), "d MMM yyyy")}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 py-6">
          <div className="mb-3 flex shrink-0 items-center justify-end gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 dark:bg-brand-end" />
              Revenue
            </span>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-12 items-end gap-2 sm:gap-3">
            {stats.months.map((month) => {
              const heightPct = month.revenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              return (
                <div
                  key={month.label}
                  className="group flex h-full min-h-[220px] flex-col items-center justify-end gap-2"
                >
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        month.revenue > 0
                          ? "bg-emerald-500 dark:bg-gradient-to-t dark:from-brand dark:to-brand-end"
                          : isLight
                            ? "bg-gray-100"
                            : "bg-white/5"
                      }`}
                      style={{ height: `${Math.max(heightPct, month.revenue > 0 ? 8 : 2)}%` }}
                      title={`${month.label}: ${formatCurrency(month.revenue)} · ${month.trips} trips`}
                    />
                  </div>
                  <div className="shrink-0 text-center">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      {month.label}
                    </p>
                    {month.trips > 0 && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{month.trips}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
