import Link from "next/link";
import { BookingTripPaymentActions } from "@/components/booking/BookingTripPaymentActions";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";
import { ensureBookingPaymentLink } from "@/lib/booking-confirmation";
import { prisma } from "@/lib/prisma";

export default async function MyBookingsPage() {
  const user = await getCustomerUserFromCookies();
  if (!user) redirect("/login?redirect=/my-bookings");

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
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    orderBy: { pickupDate: "desc" },
  });

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-white dark:bg-dark">
        <SiteContainer className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] dark:text-white">
            My bookings
          </h1>
          <p className="mt-2 text-muted">View and track your airport transfers</p>

          {bookings.length === 0 ? (
            <div className="mt-10 rounded-2xl bg-booking-bg dark:bg-dark-elevated p-8 text-center">
              <p className="text-muted">You have no bookings yet.</p>
              <Link
                href="/book"
                className="inline-block mt-4 px-6 py-3 bg-brand-gradient text-white font-medium rounded-full hover:opacity-90"
              >
                Book a transfer
              </Link>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <Link
                    href={`/booking/${booking.reference}`}
                    className="block rounded-2xl bg-booking-bg dark:bg-dark-elevated p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold dark:text-white">{booking.reference}</p>
                        <p className="text-sm text-muted mt-1">
                          {format(booking.pickupDate, "EEE d MMM yyyy · HH:mm")}
                        </p>
                        <p className="text-sm text-muted mt-1">
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
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-light dark:bg-brand/10 text-brand">
                        {booking.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
