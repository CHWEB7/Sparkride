"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Users } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { formatBookingStatus } from "@/lib/booking-status";

type CustomerRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  bookingCount: number;
  lastBooking: {
    id: string;
    reference: string;
    status: string;
    pickupDate: string;
  } | null;
};

export function DriverCustomersList({ fullHeight = false }: { fullHeight?: boolean }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/driver/customers")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load customers");
        setCustomers(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const thClass = `px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${
    isLight ? "text-gray-500 bg-gray-50" : "text-gray-400 bg-white/5"
  }`;
  const tdClass = `px-4 py-3 text-sm ${isLight ? "text-gray-700" : "text-gray-300"}`;
  const tableWrap = isLight
    ? "rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    : "rounded-xl border border-white/10 bg-dark-elevated overflow-hidden";

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center text-gray-500 ${
          fullHeight ? "h-full" : "py-20"
        }`}
      >
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading customers…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-center text-gray-500 ${
          fullHeight ? "h-full" : "py-16"
        }`}
      >
        <div>
          <Users className="mx-auto mb-4 h-12 w-12 opacity-30" />
          <p>No customers yet</p>
          <p className="mt-1 text-sm">Customers appear here after they book with you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${tableWrap} ${fullHeight ? "flex h-full min-h-0 flex-col" : ""}`}>
      <div className={`overflow-x-auto ${fullHeight ? "min-h-0 flex-1 overflow-y-auto" : ""}`}>
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className={isLight ? "border-b border-gray-200" : "border-b border-white/10"}>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Phone</th>
              <th className={thClass}>Bookings</th>
              <th className={thClass}>Last trip</th>
              <th className={thClass}>Customer since</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className={
                  isLight
                    ? "border-b border-gray-100 hover:bg-gray-50/80"
                    : "border-b border-white/5 hover:bg-white/[0.02]"
                }
              >
                <td className={`${tdClass} font-medium ${isLight ? "text-gray-900" : "text-white"}`}>
                  {customer.name || "—"}
                </td>
                <td className={tdClass}>{customer.email}</td>
                <td className={tdClass}>{customer.phone || "—"}</td>
                <td className={tdClass}>{customer.bookingCount}</td>
                <td className={tdClass}>
                  {customer.lastBooking ? (
                    <div>
                      <div className="font-medium">{customer.lastBooking.reference}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(customer.lastBooking.pickupDate), "d MMM yyyy")} ·{" "}
                        {formatBookingStatus(customer.lastBooking.status)}
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={tdClass}>
                  {format(new Date(customer.createdAt), "d MMM yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className={`shrink-0 px-4 py-2 text-xs ${
          isLight ? "border-t border-gray-100 text-gray-500" : "border-t border-white/10 text-gray-400"
        }`}
      >
        {customers.length} customer{customers.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
