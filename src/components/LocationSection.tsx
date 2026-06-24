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
    <div className={`overflow-hidden ${className}`}>
      <Image
        src={SERVICE_AREA_IMAGE}
        alt="Castleford and West Yorkshire service area"
        fill
        unoptimized
        className={`object-cover ${imageClassName}`}
        sizes={sizes}
        priority={priority}
      />
      <div className="absolute inset-0 bg-black/50 dark:bg-black/60" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#6a68de]/25 via-[#5a58c8]/10 to-[#82dbdf]/15 mix-blend-soft-light dark:from-[#6a68de]/30 dark:via-[#4a48b8]/15 dark:to-[#82dbdf]/10"
        aria-hidden
      />
      {blendTop && (
        <div
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-app-bg dark:from-dark to-transparent"
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-app-bg/90 via-transparent to-transparent dark:from-dark/90 sm:hidden"
        aria-hidden
      />
    </div>
  );
}

export function LocationSection() {
  return (
    <section id="locations" className="border-y border-black/5 dark:border-white/5">
      <div className="relative overflow-hidden bg-app-bg dark:bg-dark">
        {/* Desktop: map on the right */}
        <div
          className="absolute inset-y-0 left-[38%] sm:left-[42%] lg:left-[46%] xl:left-[48%] right-0 hidden sm:block"
          aria-hidden
        >
          <LocationMapVisual
            className="absolute inset-0"
            imageClassName="scale-[1.08] min-w-full saturate-[0.65] contrast-[0.95] brightness-[0.72] object-[72%_center]"
            sizes="(max-width: 1024px) 60vw, 52vw"
          />
          <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-app-bg via-app-bg/80 to-transparent dark:from-dark dark:via-dark/80" />
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-app-bg to-transparent dark:from-dark opacity-95" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-app-bg from-[0%] via-app-bg/95 via-[34%] to-transparent to-[62%] dark:from-dark dark:via-dark/95 sm:block sm:via-[36%] sm:to-[58%] lg:via-[38%] lg:to-[54%]"
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

        {/* Mobile: full-width map below content */}
        <div className="relative z-0 sm:hidden">
          <LocationMapVisual
            className="relative aspect-[16/10] min-h-[200px] max-h-[280px] w-full"
            imageClassName="object-[center_42%] saturate-[0.7] contrast-[0.95] brightness-[0.68]"
            sizes="100vw"
            blendTop
          />
        </div>
      </div>
    </section>
  );
}
