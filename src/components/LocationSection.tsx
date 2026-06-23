import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";

const PICKUP_AREAS = [
  {
    name: "Castleford",
    detail:
      "Our home base — pickups across town centre, Xscape, Junction 32, and residential estates.",
    highlights: ["Town centre", "M62 corridor", "Glasshoughton"],
  },
  {
    name: "Leeds",
    detail:
      "City centre, train station, Headingley, Holbeck, Morley, and suburbs across West Leeds.",
    highlights: ["Leeds Station", "Headingley", "City centre"],
  },
  {
    name: "Wakefield",
    detail:
      "Wakefield city, Kirkgate, Westgate, and surrounding villages along the A638 and M1.",
    highlights: ["Wakefield city", "Kirkgate", "Outwood"],
  },
  {
    name: "Pontefract",
    detail:
      "Pontefract town, Ferrybridge, Knottingley, and routes toward the A1(M) and M62.",
    highlights: ["Pontefract town", "Knottingley", "Ferrybridge"],
  },
  {
    name: "Featherstone & Normanton",
    detail:
      "Local pickups across Featherstone, Normanton, Altofts, and the Five Towns area.",
    highlights: ["Featherstone", "Normanton", "Altofts"],
  },
  {
    name: "Garforth & East Leeds",
    detail:
      "Garforth, Kippax, Swillington, and connections to the M1 for airport and corporate travel.",
    highlights: ["Garforth", "Kippax", "M1 access"],
  },
] as const;

export function LocationSection() {
  return (
    <section id="locations" className="border-y border-black/5 dark:border-white/5">
      <div className="relative overflow-hidden bg-app-bg dark:bg-dark">
        <div
          className="absolute inset-y-0 right-0 w-full sm:w-[85%] lg:w-[68%] xl:w-[62%]"
          aria-hidden
        >
          <Image
            src="/images/location/west-yorkshire-map.png"
            alt=""
            fill
            className="object-cover object-[right_center] scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 62vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-[#6a68de]/10 dark:bg-[#6a68de]/15 mix-blend-multiply dark:mix-blend-soft-light" />
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-r from-app-bg from-[28%] via-app-bg/88 via-[42%] to-transparent to-[78%] dark:from-dark dark:via-dark/88 sm:from-[24%] sm:via-[38%] sm:to-[72%] lg:from-[22%] lg:via-[36%] lg:to-[68%]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-app-bg/80 via-transparent to-app-bg/30 dark:from-dark/80 dark:to-dark/30 sm:hidden"
          aria-hidden
        />

        <SiteContainer className="relative z-10 py-16 sm:py-20 lg:py-24">
          <div className="max-w-xl lg:max-w-lg xl:max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand/8 dark:bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand dark:text-brand-end">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              Service area
            </div>

            <h2 className="font-display mt-6 text-4xl sm:text-5xl lg:text-[3.25rem] dark:text-white leading-[1.05] tracking-[-0.02em]">
              Pickups across West Yorkshire
            </h2>

            <p className="mt-5 text-lg text-muted dark:text-gray-200 leading-relaxed">
              Based in Castleford, Sparkride collects passengers across Leeds, Wakefield,
              Pontefract, and the surrounding Five Towns — plus airport and long-distance
              transfers nationwide.
            </p>

            <p className="mt-4 text-base text-muted leading-relaxed max-w-md">
              Door-to-door electric transfers from your postcode to airports, stations,
              and events.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <AnimatedGradientButton href="/book" className="px-7 py-3.5 text-sm">
                Book from your location
              </AnimatedGradientButton>
              <Link
                href="/services/private-hire"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-7 py-3.5 text-sm font-semibold hover:bg-white dark:hover:bg-white/10 transition-colors"
              >
                Local private hire
              </Link>
            </div>
          </div>
        </SiteContainer>
      </div>

      <div className="bg-app-bg dark:bg-dark py-16 sm:py-20 lg:py-24">
        <SiteContainer>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {PICKUP_AREAS.map((area) => (
              <article
                key={area.name}
                className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-dark-elevated p-5 sm:p-6 transition-colors hover:border-brand/25 dark:hover:border-brand-end/25"
              >
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-dark dark:text-white">
                  {area.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{area.detail}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {area.highlights.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-brand/8 dark:bg-brand/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand dark:text-brand-end"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </SiteContainer>
      </div>
    </section>
  );
}
