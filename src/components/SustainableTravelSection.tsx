import Link from "next/link";
import { Leaf } from "lucide-react";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { RollingStat } from "@/components/RollingStat";

const STATS: {
  value: number;
  unit?: string;
  label: string;
  delay: number;
}[] = [
  {
    value: 30000,
    label: "Miles covered each year",
    delay: 0,
  },
  {
    value: 4000,
    label: "Litres of fuel saved per year",
    delay: 100,
  },
  {
    value: 8,
    unit: "tonnes",
    label: "CO₂ not emitted each year",
    delay: 200,
  },
  {
    value: 8000,
    unit: "kWh",
    label: "Clean energy used to charge our vehicles",
    delay: 300,
  },
];

export function SustainableTravelSection() {
  return (
    <section
      id="sustainability"
      className="py-20 sm:py-24 bg-white dark:bg-dark-elevated border-y border-black/5 dark:border-white/5"
    >
      <SiteContainer>
        <div className="grid lg:grid-cols-2 items-stretch">
          <div className="flex flex-col justify-center max-w-xl py-4 lg:py-8 lg:pr-12 xl:pr-16">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-brand/8 dark:bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand dark:text-brand-end">
              <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
              Sustainable travel
            </div>

            <h2 className="font-display mt-6 text-4xl sm:text-5xl dark:text-white leading-[1.05]">
              Electric journeys, lower impact
            </h2>

            <p className="mt-5 text-lg font-medium text-dark/90 dark:text-gray-100 leading-relaxed">
              Sparkride runs a fully electric fleet — every airport transfer, corporate trip,
              and private hire is powered by clean energy instead of petrol or diesel.
            </p>

            <p className="mt-4 text-base text-muted leading-relaxed">
              Choosing an EV transfer means fewer emissions on the road, quieter journeys for
              passengers, and a measurable difference for the environment. We track the miles
              we cover and the fuel we replace, so you can see the impact of travelling with us.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <AnimatedGradientButton href="/book" className="px-7 py-3.5 text-sm">
                Book an electric ride
              </AnimatedGradientButton>
              <Link
                href="/services/private-hire"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-7 py-3.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Our services
              </Link>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 border-t lg:border-t-0 lg:border-l border-black/8 dark:border-white/10">
            <div className="grid grid-cols-2 h-full">
              {STATS.map((stat, index) => (
                <RollingStat
                  key={stat.label}
                  value={stat.value}
                  unit={stat.unit}
                  label={stat.label}
                  delay={stat.delay}
                  className={[
                    "border-black/8 dark:border-white/10",
                    index % 2 === 0 ? "border-r" : "",
                    index < 2 ? "border-b" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
