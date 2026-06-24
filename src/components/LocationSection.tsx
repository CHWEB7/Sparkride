import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";

const SERVICE_AREA_IMAGE = "/images/location/west-yorkshire-map.jpg";

function LocationMapVisual({
  className = "",
  imageClassName = "",
  sizes,
  priority = false,
  blendTop = false,
}: {
  className?: string;
  imageClassName?: string;
  sizes: string;
  priority?: boolean;
  blendTop?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={SERVICE_AREA_IMAGE}
        alt="Castleford and West Yorkshire service area"
        fill
        unoptimized
        className={`object-cover ${imageClassName}`}
        sizes={sizes}
        priority={priority}
      />
      <div className="absolute inset-0 bg-black/40 dark:bg-black/50" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#6a68de]/20 via-transparent to-[#82dbdf]/10"
        aria-hidden
      />
      {blendTop && (
        <div
          className="absolute inset-x-0 top-0 z-[1] h-20 bg-gradient-to-b from-app-bg dark:from-dark to-transparent"
          aria-hidden
        />
      )}
    </div>
  );
}

export function LocationSection() {
  return (
    <section id="locations" className="border-y border-black/5 dark:border-white/5">
      <div className="relative overflow-hidden bg-app-bg dark:bg-dark sm:flex sm:min-h-[520px]">
        <SiteContainer className="relative z-10 py-12 sm:py-20 lg:py-24 sm:w-[42%] sm:max-w-none sm:shrink-0 lg:w-[44%]">
          <div className="max-w-xl">
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

        {/* Desktop: image panel */}
        <div className="relative hidden sm:block sm:flex-1 sm:min-h-[520px]">
          <LocationMapVisual
            className="absolute inset-0"
            imageClassName="brightness-[0.78] saturate-[0.85] object-center"
            sizes="58vw"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-24 bg-gradient-to-r from-app-bg dark:from-dark to-transparent"
            aria-hidden
          />
        </div>

        {/* Mobile: image below copy */}
        <div className="relative w-full sm:hidden">
          <LocationMapVisual
            className="aspect-[16/10] min-h-[220px] w-full"
            imageClassName="brightness-[0.75] saturate-[0.85] object-center"
            sizes="100vw"
            blendTop
          />
        </div>
      </div>
    </section>
  );
}
