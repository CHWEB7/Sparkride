import Link from "next/link";
import { AIRPORTS } from "@/lib/airports";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { CalendarCheck, CarFront, MapPin, PlaneTakeoff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURED_CODES = ["LBA", "MAN", "LHR"];

const PROCESS_STEPS: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  hoverShift: string;
}[] = [
  {
    step: "01",
    title: "Book",
    description: "Choose your airport, date, and vehicle online in minutes.",
    icon: CalendarCheck,
    hoverShift: "hover:-translate-y-2 hover:translate-x-1",
  },
  {
    step: "02",
    title: "Pick up",
    description: "Your driver meets you at home, hotel, or the terminal — on time.",
    icon: CarFront,
    hoverShift: "hover:-translate-y-3",
  },
  {
    step: "03",
    title: "Fly",
    description: "Relax knowing your transfer is fixed-price with no surprises.",
    icon: PlaneTakeoff,
    hoverShift: "hover:-translate-y-2 hover:-translate-x-1",
  },
];

export function AirportsSection() {
  const featuredAirports = AIRPORTS.filter((airport) =>
    FEATURED_CODES.includes(airport.code)
  );

  return (
    <section id="airports" className="py-20 sm:py-24 bg-white dark:bg-dark-elevated">
      <SiteContainer>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Airport transfers
            </p>
            <h2 className="font-display mt-3 text-4xl sm:text-5xl dark:text-white leading-[1.05]">
              Stress-free rides to the runway
            </h2>
            <p className="mt-5 text-lg text-muted leading-relaxed">
              Sparkride offers fixed-price private hire airport transfers from Castleford and
              across Yorkshire. Professional drivers, flight-friendly pickup times, and space for
              luggage — whether you are heading away or coming home.
            </p>
            <p className="mt-4 text-base text-muted leading-relaxed">
              We serve major UK airports with reliable outbound and return journeys, including
              popular routes from West Yorkshire to London and the North West.
            </p>

            <div className="mt-8">
              <p className="text-sm font-medium text-dark/80 dark:text-gray-300 mb-3">
                Popular airports we cover
              </p>
              <div className="flex flex-wrap gap-3">
                {featuredAirports.map((airport) => (
                  <div
                    key={airport.code}
                    className="inline-flex items-center gap-2 rounded-full border border-black/8 dark:border-white/10 bg-app-bg dark:bg-dark px-4 py-2.5"
                  >
                    <span className="text-xs font-bold text-brand bg-brand-light dark:bg-brand/10 px-2 py-0.5 rounded">
                      {airport.code}
                    </span>
                    <span className="text-sm font-medium dark:text-white">{airport.name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                Plus Manchester, Liverpool, Birmingham, Gatwick, and more.
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <AnimatedGradientButton href="/book" className="px-7 py-3.5 text-sm">
                Book airport transfer
              </AnimatedGradientButton>
              <Link
                href="/services/airport-transfers"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-7 py-3.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand mb-5 sm:mb-6">
              How it works
            </p>

            <div className="grid gap-4 sm:gap-5">
              {PROCESS_STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.step}
                    className={`group relative overflow-hidden rounded-[28px] border border-black/5 dark:border-white/10 bg-app-bg dark:bg-dark p-6 sm:p-7 shadow-[0_20px_50px_-28px_rgba(106,104,222,0.35)] transition-all duration-300 ease-out ${item.hoverShift} hover:shadow-[0_28px_60px_-24px_rgba(106,104,222,0.45)] hover:border-brand/20 dark:hover:border-brand/30`}
                  >
                    <div
                      className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-brand/10 blur-2xl transition-transform duration-300 group-hover:scale-125"
                      aria-hidden
                    />

                    <div className="relative flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand/20 transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold tracking-[0.14em] text-muted">
                            {item.step}
                          </span>
                          <h3 className="text-xl font-semibold tracking-[-0.02em] dark:text-white">
                            {item.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-muted">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
