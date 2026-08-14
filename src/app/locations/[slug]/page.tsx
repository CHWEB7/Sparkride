import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import {
  AnswerBlock,
  BreadcrumbJsonLd,
  ServiceJsonLd,
} from "@/components/seo/StructuredData";
import { getBookingUrl } from "@/lib/booking-url";
import { formatFare } from "@/lib/hub-pricing";
import { getAllLocationSlugs, getLocationBySlug, getTopRoutesForLocation } from "@/lib/locations";
import { createPageMetadata } from "@/lib/seo";
import { formatTownList, SERVICE_AREA } from "@/lib/service-area";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) return { title: "Location | Sparkride" };

  return createPageMetadata({
    title: location.title,
    description: location.metaDescription,
    path: `/locations/${slug}`,
  });
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) notFound();

  const bookingUrl = getBookingUrl({ utmSource: "location", utmCampaign: slug });
  const topRoutes = getTopRoutesForLocation();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: location.name, path: `/locations/${slug}` },
        ]}
      />
      <ServiceJsonLd
        name={`${location.name} airport transfers`}
        description={location.metaDescription}
        areaName={location.name}
      />
      <Header />
      <main className="bg-app-bg dark:bg-dark">
        <SiteContainer className="py-12 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand sm:text-sm">
              {SERVICE_AREA.region}
            </p>
            <h1 className="font-display mt-2 text-3xl leading-[1.05] tracking-[-0.02em] dark:text-white sm:mt-3 sm:text-5xl">
              {location.h1}
            </h1>
            <div className="mt-6 space-y-4">
              <AnswerBlock />
              {location.intro.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <section className="mt-12 sm:mt-16">
            <h2 className="text-xl font-semibold tracking-[-0.02em] dark:text-white sm:text-2xl">
              Popular routes from {location.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
              Fixed single-journey prices from {formatTownList(SERVICE_AREA.fixedPriceTowns)}.
            </p>
            <ul className="mt-6 divide-y divide-black/8 dark:divide-white/10 border-y border-black/8 dark:border-white/10">
              {topRoutes.map((route) => (
                <li key={route.slug} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={`/routes/${route.slug}`}
                    className="font-medium text-dark hover:text-brand dark:text-white dark:hover:text-brand-end"
                  >
                    {route.pickupName} to {route.airportName} Airport
                  </Link>
                  <span className="text-sm font-semibold text-brand dark:text-brand-end">
                    from {formatFare(route.singlePrice)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 sm:mt-16">
            <h2 className="text-xl font-semibold tracking-[-0.02em] dark:text-white sm:text-2xl">
              Frequently asked questions
            </h2>
            <dl className="mt-6 space-y-6">
              {location.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-dark dark:text-white">{faq.question}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-12 flex flex-wrap gap-2.5 border-t border-black/8 pt-8 sm:mt-16 sm:gap-3 dark:border-white/10">
            <AnimatedGradientButton href={bookingUrl} className="px-5 py-2.5 text-sm">
              Book a transfer
            </AnimatedGradientButton>
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
