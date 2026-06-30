"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { BookingTripPaymentActions } from "@/components/booking/BookingTripPaymentActions";
import type { PaymentStatus } from "@prisma/client";

export type MyBookingRow = {
  id: string;
  reference: string;
  status: string;
  pickupDate: string;
  pickupAddress: string;
  dropoffAddress: string;
  paymentStatus: PaymentStatus;
  squarePaymentLinkUrl?: string | null;
  amountDue?: number | null;
  estimatedPrice?: number | null;
};

type BookingTab = "confirmed" | "upcoming" | "all";

type MyBookingsContentProps = {
  bookings: MyBookingRow[];
  paidReference?: string | null;
};

export function MyBookingsContent({ bookings, paidReference }: MyBookingsContentProps) {
  const [tab, setTab] = useState<BookingTab>(paidReference ? "confirmed" : "all");

  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "CONFIRMED"),
    [bookings]
  );

  const upcomingBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        ["PENDING", "ACCEPTED"].includes(booking.status)
      ),
    [bookings]
  );

  const displayedBookings = useMemo(() => {
    switch (tab) {
      case "confirmed":
        return confirmedBookings;
      case "upcoming":
        return upcomingBookings;
      default:
        return bookings;
    }
  }, [tab, bookings, confirmedBookings, upcomingBookings]);

  const paidBooking = paidReference
    ? bookings.find((booking) => booking.reference === paidReference)
    : undefined;

  return (
    <>
      {paidReference && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 dark:border-green-500/30 dark:bg-green-500/10">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700 dark:text-green-400" />
          <div>
            <p className="font-semibold text-green-900 dark:text-green-300">
              Payment received
              {paidBooking ? ` for ${paidBooking.reference}` : ""}
            </p>
            <p className="mt-1 text-sm text-green-800 dark:text-green-200/90">
              Your booking is confirmed. You can review the details below in your confirmed bookings.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["confirmed", `Confirmed (${confirmedBookings.length})`],
            ["upcoming", `Upcoming (${upcomingBookings.length})`],
            ["all", `All (${bookings.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-brand text-white"
                : "border border-gray-300 bg-white text-gray-600 hover:border-brand/40 dark:border-white/15 dark:bg-dark dark:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-booking-bg p-8 text-center dark:bg-dark-elevated">
          <p className="text-muted">You have no bookings yet.</p>
          <Link
            href="/book"
            className="mt-4 inline-block rounded-full bg-brand-gradient px-6 py-3 font-medium text-white hover:opacity-90"
          >
            Book a transfer
          </Link>
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-booking-bg p-8 text-center dark:bg-dark-elevated">
          <p className="text-muted">No bookings in this section yet.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {displayedBookings.map((booking) => (
            <li
              key={booking.id}
              id={`booking-${booking.reference}`}
              className={
                paidReference === booking.reference
                  ? "rounded-2xl ring-2 ring-brand/40"
                  : undefined
              }
            >
              <Link
                href={`/booking/${booking.reference}`}
                className="block rounded-2xl bg-booking-bg p-5 transition-shadow hover:shadow-md dark:bg-dark-elevated"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold dark:text-white">{booking.reference}</p>
                    <p className="mt-1 text-sm text-muted">
                      {format(new Date(booking.pickupDate), "EEE d MMM yyyy · HH:mm")}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {booking.pickupAddress} → {booking.dropoffAddress}
                    </p>
                    <BookingTripPaymentActions
                      reference={booking.reference}
                      status={booking.status}
                      paymentStatus={booking.paymentStatus}
                      squarePaymentLinkUrl={booking.squarePaymentLinkUrl}
                      amountDue={booking.amountDue}
                      estimatedPrice={booking.estimatedPrice}
                    />
                  </div>
                  <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand dark:bg-brand/10">
                    {booking.status.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
