import Link from "next/link";
import { BookingTripPaymentActions } from "@/components/booking/BookingTripPaymentActions";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { SiteContainer } from "@/components/SiteContainer";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";
import { ensureBookingPaymentLink } from "@/lib/booking-confirmation";
import { syncBookingPaymentFromSquare } from "@/lib/square/payment-sync";
import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = new Set(["PENDING", "ACCEPTED", "CONFIRMED"]);

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCustomerUserFromCookies();
  if (!user) redirect("/login?redirect=/my-bookings");

  const { filter } = await searchParams;
  const showPast = filter === "past";

  const customer = await ensureCustomer(user);

  const initialBookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    orderBy: { pickupDate: "desc" },
  });

  for (const booking of initialBookings) {
    if (
      booking.status === "ACCEPTED" &&
      booking.paymentStatus !== "PAID" &&
      !booking.squarePaymentLinkUrl
    ) {
      await ensureBookingPaymentLink(booking.id);
    }

    if (booking.status === "ACCEPTED" && booking.paymentStatus === "AWAITING_PAYMENT") {
      await syncBookingPaymentFromSquare(booking.reference);
    }
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    orderBy: { pickupDate: "desc" },
  });

  const visibleBookings = showPast
    ? bookings.filter((booking) => !ACTIVE_STATUSES.has(booking.status))
    : bookings.filter((booking) => ACTIVE_STATUSES.has(booking.status));

  return (
    <SiteContainer className="max-w-3xl pt-8">
      <h1 className="text-3xl font-semibold tracking-[-0.02em] dark:text-white">
        {showPast ? "Previous trips" : "My bookings"}
      </h1>
      <p className="mt-2 text-muted">
        {showPast
          ? "Completed and cancelled transfers"
          : "View and track your upcoming airport transfers"}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/my-bookings"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            !showPast
              ? "bg-brand text-white"
              : "bg-booking-bg text-muted hover:text-dark dark:bg-dark-elevated dark:hover:text-white"
          }`}
        >
          Upcoming
        </Link>
        <Link
          href="/my-bookings?filter=past"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            showPast
              ? "bg-brand text-white"
              : "bg-booking-bg text-muted hover:text-dark dark:bg-dark-elevated dark:hover:text-white"
          }`}
        >
          Previous trips
        </Link>
        <Link
          href="/book"
          className="rounded-full px-4 py-2 text-sm font-semibold text-brand hover:underline"
        >
          Back to portal hub
        </Link>
      </div>

      {visibleBookings.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-booking-bg p-8 text-center dark:bg-dark-elevated">
          <p className="text-muted">
            {showPast
              ? "No previous trips yet."
              : "You have no upcoming bookings."}
          </p>
          {!showPast && (
            <Link
              href="/book"
              className="mt-4 inline-block rounded-full bg-brand-gradient px-6 py-3 font-medium text-white hover:opacity-90"
            >
              Book a transfer
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {visibleBookings.map((booking) => (
            <li key={booking.id}>
              <Link
                href={`/booking/${booking.reference}`}
                className="block rounded-2xl bg-booking-bg p-5 transition-shadow hover:shadow-md dark:bg-dark-elevated"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold dark:text-white">{booking.reference}</p>
                    <p className="mt-1 text-sm text-muted">
                      {format(booking.pickupDate, "EEE d MMM yyyy · HH:mm")}
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
    </SiteContainer>
  );
}
