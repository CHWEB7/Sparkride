import { AIRPORTS } from "@/lib/airports";
import { MapPin } from "lucide-react";

export function AirportsSection() {
  return (
    <section id="airports" className="py-24 bg-app-bg dark:bg-dark-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight dark:text-white">Airports we serve</h2>
          <p className="mt-4 text-lg text-muted">
            Fixed-price transfers to and from all major UK airports
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {AIRPORTS.map((airport) => (
            <div
              key={airport.code}
              className="bg-white dark:bg-dark rounded-2xl p-5 border-0 dark:border dark:border-white/10 shadow-sm hover:shadow-lg hover:shadow-brand/5 transition-all group"
            >
              <div>
                <span className="text-xs font-bold text-brand bg-brand-light dark:bg-brand/10 px-2 py-1 rounded">
                  {airport.code}
                </span>
                <h3 className="mt-2 font-semibold text-lg group-hover:text-brand transition-colors dark:text-white">
                  {airport.name}
                </h3>
                <p className="text-sm text-muted flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {airport.city}, {airport.region}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
