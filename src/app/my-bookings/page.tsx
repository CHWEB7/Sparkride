import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { BackToPortalHub } from "@/components/customer/BackToPortalHub";
import { MyBookingsContent } from "@/components/customer/MyBookingsContent";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";
import { ensureBookingPaymentLink } from "@/lib/booking-confirmation";
import { syncBookingPaymentFromSquare } from "@/lib/square/payment-sync";
import { prisma } from "@/lib/prisma";

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; ref?: string }>;
}) {
  const user = await getCustomerUserFromCookies();
  if (!user) redirect("/login?redirect=/my-bookings");

  const customer = await ensureCustomer(user);
  const query = await searchParams;
  const paidReference = query.paid === "1" ? query.ref ?? null : null;

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

  if (paidReference) {
    await syncBookingPaymentFromSquare(paidReference);
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    orderBy: { pickupDate: "desc" },
  });

  const rows = bookings.map((booking) => ({
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    pickupDate: booking.pickupDate.toISOString(),
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    paymentStatus: booking.paymentStatus,
    squarePaymentLinkUrl: booking.squarePaymentLinkUrl,
    amountDue: booking.amountDue,
    estimatedPrice: booking.estimatedPrice,
  }));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-16 pt-24 dark:bg-dark">
        <SiteContainer className="max-w-3xl">
          <BackToPortalHub className="mb-6" />
          <h1 className="text-3xl font-semibold tracking-[-0.02em] dark:text-white">
            My bookings
          </h1>
          <p className="mt-2 text-muted">
            View confirmed trips, upcoming journeys, and payment status.
          </p>

          <MyBookingsContent bookings={rows} paidReference={paidReference} />
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
