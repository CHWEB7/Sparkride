import Link from "next/link";
import { Plane, Shield, Clock, Star, Zap } from "lucide-react";
import { AnimatedGradientButton } from "./AnimatedGradientButton";
import { HeroAmbientBackground } from "./HeroAmbientBackground";
import { RotatingWord } from "./RotatingWord";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-app-bg dark:bg-dark">
      <HeroAmbientBackground />

      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-28 sm:py-32 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 dark:bg-white/10 backdrop-blur-sm border border-brand/15 dark:border-white/10 text-brand dark:text-brand-end text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Premium electric transfers
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-dark dark:text-white leading-[1.05] tracking-[-0.029em]">
              Travel <RotatingWord /> with{" "}
              <span className="text-brand-gradient">Sparkride</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted dark:text-gray-200 font-normal tracking-[-0.01em] leading-relaxed max-w-lg">
              Reliable private hire airport transfers from Castleford. Fixed prices,
              professional drivers, 24/7 service to all major UK airports.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <AnimatedGradientButton href="/book" className="px-8 py-4 text-base">
                Reserve a ride
              </AnimatedGradientButton>
              <Link
                href="/download"
                className="inline-flex items-center justify-center px-8 py-4 border border-dark/15 dark:border-white/25 bg-white/60 dark:bg-white/5 backdrop-blur-sm text-dark dark:text-white hover:bg-white/80 dark:hover:bg-white/15 font-medium tracking-[-0.01em] rounded-full transition-colors text-base"
              >
                Get the Android app
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 border border-dark/15 dark:border-white/25 bg-white/60 dark:bg-white/5 backdrop-blur-sm text-dark dark:text-white hover:bg-white/80 dark:hover:bg-white/15 font-medium tracking-[-0.01em] rounded-full transition-colors text-base sm:hidden"
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
                <div
                  key={label}
                  className="flex items-center gap-2 text-muted dark:text-gray-300"
                >
                  <Icon className="w-5 h-5 text-brand dark:text-brand-end shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-app-bg dark:from-dark to-transparent z-10 pointer-events-none" />
    </section>
  );
}
