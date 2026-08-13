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
      <main className="pt-20 pb-8 sm:pt-24 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden lg:pb-0 lg:pt-36">
        <SiteContainer className="py-4 sm:py-5 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden lg:py-0 lg:pb-8">
          <div className="flex flex-col gap-4 sm:gap-5 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:items-stretch lg:gap-12 lg:overflow-hidden xl:gap-16">
            <aside className="order-2 lg:order-1 lg:flex lg:min-h-0 lg:flex-col lg:justify-center lg:overflow-hidden">
              <p className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-brand sm:text-sm lg:block">
                Online booking
              </p>
              <h1 className="mt-2 hidden text-3xl font-semibold tracking-[-0.02em] dark:text-white sm:mt-3 sm:text-4xl lg:block lg:text-[2.75rem]">
                Book your transfer
              </h1>
              <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-muted sm:mt-4 sm:text-base lg:block">
                Get a live quote and complete your booking in a few steps. Your journey details,
                price, and customer information are all handled in the form.
              </p>

              <ul className="space-y-2.5 lg:mt-8 lg:space-y-5">
                {HIGHLIGHTS.map((item) => (
                  <li key={item.title} className="flex items-center gap-3 lg:items-start lg:gap-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand lg:mt-0.5 lg:h-7 lg:w-7">
                      <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4" strokeWidth={2.5} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tracking-[-0.01em] dark:text-white sm:text-base">
                        {item.title}
                      </p>
                      <p className="mt-1 hidden text-sm leading-relaxed text-muted lg:block">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            <section
              aria-label="Booking form"
              className="order-1 min-w-0 lg:order-2 lg:flex lg:min-h-0 lg:min-w-0 lg:flex-1 lg:flex-col lg:overflow-hidden"
            >
              <div className="mb-3 lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                  Online booking
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] dark:text-white">
                  Book your transfer
                </h1>
              </div>
              <ThirdPartyBookingForm className="lg:min-h-0 lg:flex-1" />
            </section>
          </div>
        </SiteContainer>
      </main>
    </div>
  );
}
