import Link from "next/link";
import { AIRPORTS } from "@/lib/airports";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { CalendarCheck, CarFront, MapPin, Plane, PlaneTakeoff } from "lucide-react";

const FEATURED_CODES = ["LBA", "MAN", "LHR"];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Book",
    description: "Choose your airport, date, and vehicle online in minutes.",
    icon: CalendarCheck,
  },
  {
    step: "02",
    title: "Pick up",
    description: "Your driver meets you at home, hotel, or the terminal — on time.",
    icon: CarFront,
  },
  {
    step: "03",
    title: "Fly",
    description: "Relax knowing your transfer is fixed-price with no surprises.",
    icon: PlaneTakeoff,
  },
] as const;

export function AirportsSection() {
  const featuredAirports = AIRPORTS.filter((airport) =>
    FEATURED_CODES.includes(airport.code)
  );

  return (
    <section id="airports" className="py-20 sm:py-24 bg-white dark:bg-dark-elevated">
      <SiteContainer>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-[32px] border border-black/5 dark:border-white/10 bg-app-bg dark:bg-dark p-6 sm:p-8 shadow-[0_24px_60px_-32px_rgba(106,104,222,0.35)] overflow-hidden">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-brand/15 blur-3xl" aria-hidden />
              <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-end/10 blur-3xl" aria-hidden />

              <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                How it works
              </p>

              <div className="relative mt-6 space-y-5">
                {PROCESS_STEPS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="relative flex gap-4">
                      {index < PROCESS_STEPS.length - 1 && (
                        <div
                          className="absolute left-6 top-14 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-brand/50 to-brand-end/20"
                          aria-hidden
                        />
                      )}

                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand/20">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </div>

                      <div className="min-w-0 pb-1">
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
                  );
                })}
              </div>

              <div className="relative mt-8 flex items-center justify-between rounded-2xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium dark:text-white">
                  <Plane className="h-4 w-4 text-brand" />
                  Door to terminal
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                  Fixed price
                </span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="max-w-xl lg:ml-auto">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                Airport transfers
              </p>
              <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-[-0.029em] dark:text-white leading-[1.05]">
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
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
