import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { FaresSections } from "@/components/FaresSections";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";

export const metadata: Metadata = {
  title: "Fixed fares | Sparkride",
  description:
    "Fixed transfer fares from Castleford and surrounding West Yorkshire areas to UK airports, ferry ports, and cruise terminals.",
};

export default function FaresPage() {
  return (
    <>
      <Header />
      <main className="bg-app-bg dark:bg-dark">
        <SiteContainer className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Fixed pricing
            </p>
            <h1 className="font-display mt-3 text-4xl sm:text-5xl dark:text-white leading-[1.05] tracking-[-0.02em]">
              Transfer fares from West Yorkshire
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed">
              These are fixed single-journey prices when you are collected from Castleford and
              surrounding West Yorkshire areas. Return journeys are priced at twice the single fare.
              Airport drop-off fees charged to us are included — not passed on to you.
            </p>
            <p className="mt-4 inline-flex items-center rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-4 py-2 text-sm font-medium text-dark dark:text-white">
              Valid from <span className="ml-1.5 font-semibold">06/2026</span>
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <FaresSections />
          </div>

          <div className="mt-14 sm:mt-16 pt-10 border-t border-black/8 dark:border-white/10 flex flex-col sm:flex-row gap-3">
            <AnimatedGradientButton href="/book" className="px-7 py-3.5 text-sm">
              Book your transfer
            </AnimatedGradientButton>
            <Link
              href="/#locations"
              className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-7 py-3.5 text-sm font-semibold hover:bg-white dark:hover:bg-white/10 transition-colors"
            >
              View service area
            </Link>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
