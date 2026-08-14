import { BUSINESS } from "@/lib/business";
import { FAQS } from "@/lib/faqs";
import { formatTownList, getAllServedTowns, SERVICE_AREA } from "@/lib/service-area";
import { getSiteUrl } from "@/lib/site-url";

type JsonLdValue = Record<string, unknown>;

function JsonLdScript({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SiteJsonLd() {
  const siteUrl = getSiteUrl();
  const towns = getAllServedTowns();

  const localBusiness: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TaxiService"],
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: siteUrl,
    telephone: BUSINESS.phoneTel,
    email: BUSINESS.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      addressCountry: BUSINESS.addressCountry,
    },
    areaServed: towns.map((town) => ({
      "@type": "City",
      name: town,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: SERVICE_AREA.region,
      },
    })),
    priceRange: "££",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  };

  const website: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BUSINESS.legalName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/book`,
      "query-input": "required name=search_term_string",
    },
  };

  const faqPage: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLdScript data={localBusiness} />
      <JsonLdScript data={website} />
      <JsonLdScript data={faqPage} />
    </>
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const siteUrl = getSiteUrl();

  const data: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };

  return <JsonLdScript data={data} />;
}

export function ServiceJsonLd({
  name,
  description,
  areaName,
}: {
  name: string;
  description: string;
  areaName: string;
}) {
  const data: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "LocalBusiness",
      name: BUSINESS.name,
      telephone: BUSINESS.phoneTel,
    },
    areaServed: {
      "@type": "City",
      name: areaName,
    },
  };

  return <JsonLdScript data={data} />;
}

export function AnswerBlock() {
  const towns = formatTownList(SERVICE_AREA.fixedPriceTowns);

  return (
    <aside className="rounded-2xl border border-brand/15 bg-brand/5 px-4 py-4 sm:px-5 sm:py-5 dark:border-brand/25 dark:bg-brand/10">
      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 sm:text-base">
        <strong className="font-semibold text-dark dark:text-white">Sparkride</strong> provides
        fixed-price electric airport transfers from{" "}
        <strong className="font-semibold text-dark dark:text-white">{towns}</strong> to all major
        UK airports. Leeds Bradford from <strong className="font-semibold text-dark dark:text-white">£45</strong>.
        Book online at{" "}
        <a href="/book" className="font-semibold text-brand hover:underline dark:text-brand-end">
          sparkride.co.uk/book
        </a>{" "}
        or call <strong className="font-semibold text-dark dark:text-white">{BUSINESS.phone}</strong>.
      </p>
    </aside>
  );
}
