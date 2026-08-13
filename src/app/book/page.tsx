import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Header } from "@/components/Header";
import { SiteContainer } from "@/components/SiteContainer";
import { BookPageScrollLock } from "@/components/booking/BookPageScrollLock";
import { ThirdPartyBookingForm } from "@/components/booking/ThirdPartyBookingForm";

export const metadata: Metadata = {
  title: "Book a transfer | Sparkride",
  description:
    "Book your Sparkride airport transfer online. Live pricing, vehicle options, and instant quotes.",
};

const HIGHLIGHTS = [
  {
    title: "Fixed prices",
    description:
      "Transparent fixed fares for airports, ferry ports, and cruise terminals from Castleford and Leeds.",
  },
  {
    title: "Fully electric vehicles",
    description: "Travel in modern electric cars for a quieter, cleaner journey.",
  },
  {
    title: "Fully licensed",
    description: "Licensed with Wakefield Council for your peace of mind.",
  },
] as const;

export default function BookPage() {
  return (
    <div className="bg-app-bg dark:bg-dark max-lg:min-h-screen lg:fixed lg:inset-0 lg:z-0 lg:flex lg:flex-col lg:overflow-hidden">
      <BookPageScrollLock />
      <Header />
      <main className="max-lg:pb-10 pt-24 sm:pt-28 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden lg:pb-0 lg:pt-28 sm:pt-32 lg:pt-36">
        <SiteContainer className="py-8 sm:py-10 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden lg:py-0 lg:pb-5 sm:pb-6 lg:pb-8">
          <div className="flex flex-col gap-8 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:items-stretch lg:gap-12 lg:overflow-hidden xl:gap-16">
            <aside className="rounded-2xl border border-black/8 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-dark-elevated/90 lg:flex lg:min-h-0 lg:flex-col lg:justify-center lg:overflow-hidden lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                Online booking
              </p>
              <h1 className="mt-2 sm:mt-3 text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] dark:text-white">
                Book your transfer
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted leading-relaxed max-w-md">
                Get a live quote and complete your booking in a few steps. Your journey details,
                price, and customer information are all handled in the form.
              </p>

              <ul className="mt-5 space-y-4 sm:mt-8 sm:space-y-5">
                {HIGHLIGHTS.map((item) => (
                  <li key={item.title} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                      <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold tracking-[-0.01em] dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-muted leading-relaxed">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            <section
              aria-label="Booking form"
              className="min-w-0 lg:flex lg:min-h-0 lg:min-w-0 lg:flex-1 lg:flex-col lg:overflow-hidden"
            >
              <p className="mb-3 text-sm font-semibold text-muted lg:hidden">
                Complete your booking
              </p>
              <ThirdPartyBookingForm className="lg:min-h-0 lg:flex-1" />
            </section>
          </div>
        </SiteContainer>
      </main>
    </div>
  );
}
