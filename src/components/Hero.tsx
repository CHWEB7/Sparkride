import Link from "next/link";
import { Plane, Shield, Clock, Star } from "lucide-react";
import { AnimatedGradientButton } from "./AnimatedGradientButton";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-dark overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-brand-start rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-brand-end rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-brand-end text-sm font-medium mb-6">
            <Plane className="w-4 h-4" />
            Airport transfers across the UK
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-[-0.029em]">
            Travel freely with{" "}
            <span className="text-brand-gradient">Sparkride</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-300 font-normal tracking-[-0.01em] leading-relaxed max-w-lg">
            Reliable private hire airport transfers from Castleford. Fixed prices,
            professional drivers, 24/7 service to all major UK airports.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <AnimatedGradientButton href="/book" className="px-8 py-4 text-base">
              Reserve a ride
            </AnimatedGradientButton>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white hover:bg-white/10 font-medium tracking-[-0.01em] rounded-full transition-colors text-base"
            >
              How it works
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: "Fully licensed" },
              { icon: Clock, label: "24/7 service" },
              { icon: Star, label: "5-star rated" },
              { icon: Plane, label: "12 airports" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-400">
                <Icon className="w-5 h-5 text-brand-end shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
