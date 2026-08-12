import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { getBookingUrl } from "@/lib/booking-url";
import {
  airportWaitingFeePer15Min,
  CANCELLATION_POLICY_TITLE,
} from "@/lib/cancellation-policy";

export const metadata: Metadata = {
  title: "Cancellation & delays policy | Sparkride",
  description:
    "Sparkride airport transfer cancellation, flight delay, waiting time, and no-show policy.",
};

export default function CancellationPolicyPage() {
  const waitingFee = airportWaitingFeePer15Min();
  const bookingUrl = getBookingUrl();

  return (
    <>
      <Header />
      <main className="bg-app-bg dark:bg-dark">
        <SiteContainer className="max-w-3xl py-12 sm:py-20 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand sm:text-sm">
            Policy
          </p>
          <h1 className="font-display mt-2 text-3xl leading-[1.05] tracking-[-0.02em] dark:text-white sm:mt-3 sm:text-5xl">
            {CANCELLATION_POLICY_TITLE}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:mt-5 sm:text-lg">
            Please read this policy before completing payment for your booking. It explains
            cancellations, flight delays, waiting time, and no-shows.
          </p>

          <div className="prose-policy mt-8 space-y-8 sm:mt-12">
            <PolicySection title="Cancellations">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Cancellations made <strong>48 hours or more</strong> before the scheduled pickup
                  time will receive a <strong>full refund</strong>.
                </li>
                <li>
                  Cancellations made <strong>less than 48 hours</strong> before the scheduled pickup
                  time are <strong>non-refundable</strong>.
                </li>
                <li>
                  Any amendments to bookings are subject to availability and may incur additional
                  charges.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="Flight delays">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  We monitor all incoming flight arrivals where a flight number has been provided.
                </li>
                <li>
                  If your flight is delayed, we will adjust your pickup time where possible at no
                  extra charge.
                </li>
                <li>
                  Significant delays that require rescheduling or additional driver waiting time may
                  incur an additional fee.
                </li>
                <li>
                  If your flight is cancelled, please contact us as soon as possible to discuss your
                  options.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="Waiting time">
              <h3 className="text-base font-semibold dark:text-white">Airport pickups</h3>
              <p className="mt-2">
                Your driver will be in contact with you after your flight arrives. We recommend
                booking a pickup time of 45 minutes after landing. If you cannot meet your driver
                within 60 minutes of your flight landing, additional waiting time will be charged at{" "}
                <strong>£{waitingFee} per 15 minutes</strong> (based on airport parking fees).
              </p>

              <h3 className="mt-6 text-base font-semibold dark:text-white">Non-airport pickups</h3>
              <p className="mt-2">
                A 15-minute grace period is included. Additional waiting time will be charged after
                this period.
              </p>
            </PolicySection>

            <PolicySection title="No shows">
              <p>A booking will be classed as a no-show if:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  The passenger cannot be contacted after the included waiting period of 60 minutes.
                </li>
                <li>The passenger fails to arrive at the agreed pickup location.</li>
                <li>
                  Incorrect booking information is provided and contact cannot be made.
                </li>
              </ul>
              <p className="mt-3">No-shows are non-refundable.</p>
            </PolicySection>

            <PolicySection title="Customer delays">
              <p>
                If you know you will be late, please contact us immediately. We will do our best to
                accommodate changes, but this cannot be guaranteed and additional charges may apply.
              </p>
            </PolicySection>

            <PolicySection title="Driver delays">
              <p>
                In the event that our driver is delayed due to traffic, accidents, severe weather, or
                other unforeseen circumstances, we will keep you informed and will make every effort
                to minimise disruption.
              </p>
            </PolicySection>

            <PolicySection title="Force majeure">
              <p>
                We are not liable for delays or cancellations caused by events beyond our reasonable
                control, including but not limited to severe weather, road closures, accidents,
                government restrictions, or airline operational issues.
              </p>
            </PolicySection>
          </div>

          <div className="mt-10 flex flex-wrap gap-2.5 sm:mt-12 sm:gap-3">
            <AnimatedGradientButton href={bookingUrl} className="px-5 py-2.5 text-sm sm:px-5 sm:py-2.5">
              Book a transfer
            </AnimatedGradientButton>
            <a
              href="mailto:info@sparkride.co.uk"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
            >
              Contact us
            </a>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-dark-elevated sm:p-8">
      <h2 className="text-lg font-semibold dark:text-white sm:text-xl">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted sm:text-base">{children}</div>
    </section>
  );
}
