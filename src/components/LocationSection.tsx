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

const MAP_MARKERS = [
  { label: "Leeds", top: "18%", left: "22%" },
  { label: "Castleford", top: "42%", left: "52%" },
  { label: "Wakefield", top: "58%", left: "38%" },
  { label: "Pontefract", top: "72%", left: "62%" },
] as const;

export function LocationSection() {
  return (
    <section
      id="locations"
      className="py-20 sm:py-24 bg-app-bg dark:bg-dark border-y border-black/5 dark:border-white/5"
    >
      <SiteContainer>
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand/8 dark:bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand dark:text-brand-end">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
            Service area
          </div>
          <h2 className="font-display mt-6 text-4xl sm:text-5xl dark:text-white leading-[1.05]">
            Pickups across West Yorkshire
          </h2>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            Based in Castleford, Sparkride collects passengers across Leeds, Wakefield,
            Pontefract, and the surrounding Five Towns — plus airport and long-distance
            transfers nationwide.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="relative overflow-hidden rounded-[28px] min-h-[320px] sm:min-h-[400px] lg:min-h-[520px] shadow-[0_24px_60px_-24px_rgba(106,104,222,0.35)] ring-1 ring-black/5 dark:ring-white/10">
            <Image
              src="/images/location/west-yorkshire-map.png"
              alt="Map showing Sparkride pickup areas across Leeds, Castleford, Wakefield, and Pontefract"
              fill
              className="object-cover object-center scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={false}
            />

            <div
              className="absolute inset-0 bg-gradient-to-tr from-[#6a68de]/85 via-[#6a68de]/45 to-[#82dbdf]/25 dark:from-[#6a68de]/90 dark:via-[#4f4db8]/55 dark:to-[#82dbdf]/20"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10 dark:from-black/50"
              aria-hidden
            />

            {MAP_MARKERS.map((marker) => (
              <div
                key={marker.label}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ top: marker.top, left: marker.left }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-brand shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
                </span>
                <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 dark:bg-dark/95 px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em] text-dark dark:text-white shadow-sm">
                  {marker.label}
                </span>
              </div>
            ))}

            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
                West Yorkshire coverage
              </p>
              <p className="mt-2 max-w-sm text-lg font-medium leading-snug text-white">
                Door-to-door electric transfers from your postcode to airports, stations,
                and events.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
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
        </div>

        <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-3">
          <AnimatedGradientButton href="/book" className="px-7 py-3.5 text-sm">
            Book from your location
          </AnimatedGradientButton>
          <Link
            href="/services/private-hire"
            className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-7 py-3.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Local private hire
          </Link>
        </div>
      </SiteContainer>
    </section>
  );
}
