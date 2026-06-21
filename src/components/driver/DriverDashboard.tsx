"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Phone,
  User,
  Plane,
  ChevronDown,
  Loader2,
} from "lucide-react";

type Booking = {
  id: string;
  reference: string;
  status: string;
  journeyType: string;
  serviceType: string;
  tripType: string;
  airportName: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  returnPickupDate: string | null;
  passengers: number;
  luggage: number;
  vehicleType: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  flightNumber: string | null;
  returnFlightNumber: string | null;
  notes: string | null;
  estimatedPrice: number | null;
};

const STATUSES = ["PENDING", "CONFIRMED", "EN_ROUTE", "COMPLETED", "CANCELLED"];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  CONFIRMED: "bg-blue-500/20 text-blue-400",
  EN_ROUTE: "bg-purple-500/20 text-purple-400",
  COMPLETED: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
};

export function DriverDashboard({ bookings: initial }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initial);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/driver/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const counts = STATUSES.reduce(
    (acc, s) => {
      acc[s] = bookings.filter((b) => b.status === s).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === "ALL" ? "bg-brand-gradient text-white" : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          All ({bookings.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === s ? "bg-brand-gradient text-white" : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {s.replace("_", " ")} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Plane className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-dark-elevated rounded-2xl p-6 border border-white/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-lg text-white">{booking.reference}</span>
                    {booking.journeyType === "RETURN" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand/20 text-brand-end">
                        RETURN
                      </span>
                    )}
                    {booking.serviceType === "PRE_BOOKED" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-gray-300">
                        PRE-BOOKED
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[booking.status]}`}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Out: {format(new Date(booking.pickupDate), "EEE d MMM yyyy · HH:mm")}
                    {booking.returnPickupDate && (
                      <span>
                        · Ret: {format(new Date(booking.returnPickupDate), "EEE d MMM · HH:mm")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={booking.status}
                    disabled={updating === booking.id}
                    onChange={(e) => updateStatus(booking.id, e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium cursor-pointer focus:border-brand outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-dark">
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  {updating === booking.id ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                  <div>
                    <div className="text-gray-400">
                      {booking.serviceType === "PRE_BOOKED"
                        ? booking.journeyType === "RETURN"
                          ? "Pre-booked return"
                          : "Pre-booked journey"
                        : booking.journeyType === "RETURN"
                          ? `Return trip · ${booking.airportName}`
                          : `${booking.tripType === "TO_AIRPORT" ? "To" : "From"} ${booking.airportName}`}
                    </div>
                    <div className="text-white">{booking.pickupAddress}</div>
                    <div className="text-gray-500">→ {booking.dropoffAddress}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand" />
                    <span className="text-white">{booking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand" />
                    <a href={`tel:${booking.customerPhone}`} className="text-brand hover:underline">
                      {booking.customerPhone}
                    </a>
                  </div>
                  <div className="text-gray-400">
                    {booking.vehicleType} · {booking.passengers} pax · {booking.luggage} bags
                    {booking.flightNumber && ` · Out: ${booking.flightNumber}`}
                    {booking.returnFlightNumber && ` · Ret: ${booking.returnFlightNumber}`}
                  </div>
                  {booking.estimatedPrice && (
                    <div className="text-brand-end font-bold">£{booking.estimatedPrice}</div>
                  )}
                  {booking.notes && (
                    <div className="text-gray-500 italic">Note: {booking.notes}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
