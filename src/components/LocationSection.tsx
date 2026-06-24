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
          className="absolute inset-y-0 left-[38%] sm:left-[42%] lg:left-[46%] xl:left-[48%] right-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute inset-0">
            <Image
              src="/images/location/west-yorkshire-map.png"
              alt=""
              fill
              className="object-cover scale-[1.14] min-w-full saturate-[0.72] contrast-[0.9] brightness-[1.06] hue-rotate-[8deg] dark:saturate-[0.58] dark:brightness-[0.82] dark:contrast-[0.95] dark:hue-rotate-[12deg]"
              style={{ objectPosition: "72% center" }}
              sizes="(max-width: 1024px) 60vw, 52vw"
              priority={false}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-[#6a68de]/30 via-[#7a9ee8]/12 to-[#82dbdf]/22 mix-blend-soft-light dark:from-[#6a68de]/35 dark:via-[#5a58c8]/18 dark:to-[#82dbdf]/15 dark:mix-blend-color" />
          <div className="absolute inset-0 bg-app-bg/25 dark:bg-dark/35" />
          <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-app-bg via-app-bg/75 to-transparent dark:from-dark dark:via-dark/75" />
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-app-bg to-transparent dark:from-dark opacity-95" />
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-r from-app-bg from-[0%] via-app-bg/95 via-[34%] to-transparent to-[62%] dark:from-dark dark:via-dark/95 sm:via-[36%] sm:to-[58%] lg:via-[38%] lg:to-[54%]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-app-bg/85 via-transparent to-app-bg/40 dark:from-dark/85 dark:to-dark/40 sm:hidden"
          aria-hidden
        />

        <SiteContainer className="relative z-10 py-12 sm:py-20 lg:py-24">
          <div className="max-w-xl lg:max-w-lg xl:max-w-xl">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand/15 bg-brand/8 dark:bg-brand/10 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-brand dark:text-brand-end">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
              Service area
            </div>

            <h2 className="font-display mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-[3.25rem] dark:text-white leading-[1.05] tracking-[-0.02em]">
              Fixed pricing for Castleford and surrounding areas
            </h2>

            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted dark:text-gray-200 leading-relaxed">
              We use fixed pricing for many of our services — including airport, ferry port,
              and cruise terminal transfers when you are collected from certain West Yorkshire
              areas. You will know what the cost is before you travel, with no surprises.
            </p>

            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted leading-relaxed max-w-md">
              Drop-off fees that some airports charge us are covered by Sparkride, not passed on
              to you.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <AnimatedGradientButton href="/book" className="px-5 py-2.5 text-sm sm:px-7 sm:py-3.5">
                Book from your location
              </AnimatedGradientButton>
              <Link
                href="/fares"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-5 py-2.5 sm:px-7 sm:py-3.5 text-sm font-semibold hover:bg-white dark:hover:bg-white/10 transition-colors"
              >
                View fixed fares
              </Link>
              <Link
                href="/services/private-hire"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-5 py-2.5 sm:px-7 sm:py-3.5 text-sm font-semibold hover:bg-white dark:hover:bg-white/10 transition-colors"
              >
                Local private hire
              </Link>
            </div>
          </div>
        </SiteContainer>
      </div>

      <div className="bg-app-bg dark:bg-dark py-12 sm:py-20 lg:py-24">
        <SiteContainer>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {PICKUP_AREAS.map((area) => (
              <article
                key={area.name}
                className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-dark-elevated p-4 sm:p-6 transition-colors hover:border-brand/25 dark:hover:border-brand-end/25"
              >
                <h3 className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-dark dark:text-white">
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
