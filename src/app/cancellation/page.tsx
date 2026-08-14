import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { CancellationPolicyTimeline } from "@/components/cancellation/CancellationPolicyTimeline";
import { buildCancellationPolicySections } from "@/lib/cancellation-policy-sections";
import { airportWaitingFeePer15Min } from "@/lib/cancellation-policy";
import { getBookingUrl } from "@/lib/booking-url";

export const metadata: Metadata = {
  title: "Cancellation & delays policy | Sparkride",
  description:
    "Sparkride airport transfer cancellation, flight delay, waiting time, and no-show policy.",
};

export default function CancellationPolicyPage() {
  const waitingFee = airportWaitingFeePer15Min();
  const sections = buildCancellationPolicySections(waitingFee);
  const bookingUrl = getBookingUrl();

  return (
    <>
      <Header />
      <main className="bg-app-bg dark:bg-dark">
        <SiteContainer className="max-w-5xl py-12 sm:py-20 lg:py-24">
          <CancellationPolicyTimeline sections={sections} bookingUrl={bookingUrl} />
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
