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
    <div className="fixed inset-0 z-0 flex flex-col overflow-hidden bg-app-bg dark:bg-dark">
      <BookPageScrollLock />
      <Header />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden pt-28 sm:pt-32 lg:pt-36">
        <SiteContainer className="flex min-h-0 flex-1 flex-col overflow-hidden pb-5 sm:pb-6 lg:pb-8">
          <div className="grid min-h-0 flex-1 items-stretch gap-6 overflow-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-12 xl:gap-16">
            <aside className="flex min-h-0 flex-col justify-center overflow-hidden max-lg:max-h-[38%]">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                Online booking
              </p>
              <h1 className="mt-2 sm:mt-3 text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] dark:text-white">
                Book your transfer
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted leading-relaxed max-w-md max-lg:line-clamp-2 lg:line-clamp-none">
                Get a live quote and complete your booking in a few steps. Your journey details,
                price, and customer information are all handled in the form.
              </p>

              <ul className="mt-5 sm:mt-8 space-y-3 sm:space-y-5">
                {HIGHLIGHTS.map((item) => (
                  <li key={item.title} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                      <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold tracking-[-0.01em] dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-muted leading-relaxed max-lg:hidden">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            <section
              aria-label="Booking form"
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            >
              <ThirdPartyBookingForm className="min-h-0 flex-1" />
            </section>
          </div>
        </SiteContainer>
      </main>
    </div>
  );
}
