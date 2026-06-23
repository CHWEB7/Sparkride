import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { BookingPaymentSection } from "@/components/booking/BookingPaymentSection";
import { CheckCircle, Calendar, MapPin, Car, User, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";
import { getServiceLabel, isHubTransfer } from "@/lib/hubs";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const user = await getCustomerUserFromCookies();
  if (!user) redirect(`/login?redirect=/booking/${reference}`);

  const customer = await ensureCustomer(user);
  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking || booking.customerId !== customer.id) notFound();

  const isReturn = booking.journeyType === "RETURN";
  const isHub = isHubTransfer(booking.serviceType);
  const isConfirmed = booking.status !== "PENDING";

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    EN_ROUTE: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-white dark:bg-dark">
        <SiteContainer className="max-w-3xl">
          <div className="mb-10">
            <div className="w-16 h-16 rounded-full bg-brand-light dark:bg-brand/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-brand" />
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight dark:text-white">
              {isConfirmed ? "Booking confirmed" : "Booking received"}
            </h1>
            <p className="mt-3 text-lg text-muted">
              Your reference number is{" "}
              <span className="font-bold text-dark dark:text-white">{booking.reference}</span>
            </p>
          </div>

          {booking.status === "CONFIRMED" && (
            <div className="mb-6">
              <BookingPaymentSection
                reference={booking.reference}
                paymentStatus={booking.paymentStatus}
                amountDue={booking.amountDue}
                estimatedPrice={booking.estimatedPrice}
                paymentLinkUrl={booking.squarePaymentLinkUrl}
                paidAt={booking.paidAt}
              />
            </div>
          )}

          <div className="bg-booking-bg dark:bg-dark-elevated rounded-3xl p-6 sm:p-8 shadow-md dark:shadow-sm border-0 dark:border dark:border-white/10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-muted">Status</span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-light dark:bg-brand/10 text-brand">
                  {getServiceLabel(booking.serviceType).toUpperCase()}
                </span>
                {isReturn && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-light dark:bg-brand/10 text-brand">
                    RETURN
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[booking.status]}`}>
                  {booking.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <div className="text-sm text-muted">
                    {isReturn ? "Outbound date & time" : "Date & time"}
                  </div>
                  <div className="font-semibold dark:text-white">
                    {format(booking.pickupDate, "EEEE d MMMM yyyy 'at' HH:mm")}
                  </div>
                </div>
              </div>

              {isReturn && booking.returnPickupDate && (
                <div className="flex items-start gap-3">
                  <ArrowLeftRight className="w-5 h-5 text-brand-end mt-0.5" />
                  <div>
                    <div className="text-sm text-muted">Return date & time</div>
                    <div className="font-semibold dark:text-white">
                      {format(booking.returnPickupDate, "EEEE d MMMM yyyy 'at' HH:mm")}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <div className="text-sm text-muted">
                    {isHub
                      ? isReturn
                        ? `Return trip to ${booking.airportName}`
                        : `${booking.tripType === "TO_AIRPORT" ? "To" : "From"} ${booking.airportName}`
                      : isReturn
                        ? "Return journey"
                        : "Pre-booked journey"}
                  </div>
                  <div className="font-semibold dark:text-white">{booking.pickupAddress}</div>
                  <div className="text-sm text-muted mt-1">→ {booking.dropoffAddress}</div>
                  {isReturn && isHub && (
                    <div className="text-sm text-muted mt-1">→ {booking.pickupAddress} (return)</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <div className="text-sm text-muted">Vehicle</div>
                  <div className="font-semibold dark:text-white">
                    {booking.vehicleType} · {booking.passengers} passenger
                    {booking.passengers > 1 ? "s" : ""} · {booking.luggage} bag
                    {booking.luggage !== 1 ? "s" : ""}
                  </div>
                  {booking.flightNumber && (
                    <div className="text-sm text-muted mt-1">
                      Outbound flight: {booking.flightNumber}
                      {booking.returnFlightNumber && ` · Return: ${booking.returnFlightNumber}`}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <div className="text-sm text-muted">Passenger</div>
                  <div className="font-semibold dark:text-white">{booking.customerName}</div>
                  <div className="text-sm text-muted">{booking.customerPhone}</div>
                </div>
              </div>
            </div>

            {booking.estimatedPrice && (
              <div className="pt-4 flex justify-between items-center dark:border-t dark:border-white/10">
                <span className="text-muted">Fare</span>
                <span className="text-2xl font-bold text-brand-gradient">£{booking.estimatedPrice}</span>
              </div>
            )}
          </div>

          <div className="mt-8">
            <p className="text-sm text-muted mb-4">
              {booking.status === "PENDING"
                ? "Your driver will confirm this booking shortly."
                : booking.paymentStatus === "AWAITING_PAYMENT"
                  ? "Please complete payment before your travel date."
                  : "Save your reference number for your records."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-dark text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Back to home
            </Link>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
