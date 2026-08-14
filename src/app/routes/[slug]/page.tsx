import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { AnswerBlock, BreadcrumbJsonLd } from "@/components/seo/StructuredData";
import { getBookingUrl } from "@/lib/booking-url";
import { formatFare } from "@/lib/hub-pricing";
import { getAllRouteSlugs, getRouteBySlug } from "@/lib/routes";
import { createPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) return { title: "Route | Sparkride" };

  const title = `${route.pickupName} to ${route.airportName} Airport Transfer`;
  const description = `Fixed-price ${route.pickupName} to ${route.airportName} airport transfer from ${formatFare(route.singlePrice)} single. Electric fleet, 24/7 booking with Sparkride.`;

  return createPageMetadata({
    title,
    description,
    path: `/routes/${slug}`,
  });
}

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) notFound();

  const bookingUrl = getBookingUrl({ utmSource: "route", utmCampaign: slug });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Fares", path: "/fares" },
          {
            name: `${route.pickupName} to ${route.airportName}`,
            path: `/routes/${slug}`,
          },
        ]}
      />
      <Header />
      <main className="bg-app-bg dark:bg-dark">
        <SiteContainer className="py-12 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand sm:text-sm">
              Fixed route
            </p>
            <h1 className="font-display mt-2 text-3xl leading-[1.05] tracking-[-0.02em] dark:text-white sm:mt-3 sm:text-5xl">
              {route.pickupName} to {route.airportName} Airport — from {formatFare(route.singlePrice)}
            </h1>
            <div className="mt-6 space-y-4">
              <AnswerBlock />
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                Book a fixed-price electric airport transfer from {route.pickupName} to{" "}
                {route.airportName} Airport with Sparkride. Your fare is confirmed before you travel
                — no surge pricing and no airport drop-off fees passed on to you.
              </p>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                Typical journey time is {route.journeyTime}. Our fully electric fleet includes
                professional drivers, flight monitoring on airport pickups, and 24/7 online booking.
              </p>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/8 bg-white/60 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Single
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-brand dark:text-brand-end">
                  {formatFare(route.singlePrice)}
                </dd>
              </div>
              <div className="rounded-2xl border border-black/8 bg-white/60 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Return
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-brand dark:text-brand-end">
                  {formatFare(route.returnPrice)}
                </dd>
              </div>
              <div className="rounded-2xl border border-black/8 bg-white/60 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Journey time
                </dt>
                <dd className="mt-1 text-lg font-semibold text-dark dark:text-white">
                  {route.journeyTime}
                </dd>
              </div>
            </dl>

            <section className="mt-10">
              <h2 className="text-xl font-semibold tracking-[-0.02em] dark:text-white sm:text-2xl">
                What&apos;s included
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                <li>Fixed fare confirmed at booking</li>
                <li>Fully electric, professional private hire vehicle</li>
                <li>Flight monitoring when a flight number is provided</li>
                <li>Airport drop-off fees covered by Sparkride</li>
                <li>Single or return journeys available</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 flex flex-wrap gap-2.5 border-t border-black/8 pt-8 sm:mt-16 sm:gap-3 dark:border-white/10">
            <AnimatedGradientButton href={bookingUrl} className="px-5 py-2.5 text-sm">
              Book this transfer
            </AnimatedGradientButton>
            <Link
              href="/cancellation"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
            >
              Cancellation policy
            </Link>
            <Link
              href="/fares"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
            >
              View all fares
            </Link>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
