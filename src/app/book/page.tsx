import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
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
    description:
      "Travel in modern electric cars for a quieter, cleaner journey.",
  },
  {
    title: "Fully licensed",
    description:
      "Licensed with Wakefield Council for your peace of mind.",
  },
] as const;

export default function BookPage() {
  return (
    <>
      <Header />
      <main className="bg-app-bg dark:bg-dark">
        <SiteContainer className="py-10 sm:py-14 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-12 xl:gap-16">
            <aside className="lg:sticky lg:top-28">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                Online booking
              </p>
              <h1 className="mt-2 sm:mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] dark:text-white">
                Book your transfer
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-md">
                Get a live quote and complete your booking in a few steps. Your journey details,
                price, and customer information are all handled in the form.
              </p>

              <ul className="mt-8 sm:mt-10 space-y-5">
                {HIGHLIGHTS.map((item) => (
                  <li key={item.title} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                      <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    </span>
                    <div>
                      <p className="text-base font-semibold tracking-[-0.01em] dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-muted leading-relaxed">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            <section aria-label="Booking form" className="min-w-0">
              <ThirdPartyBookingForm />
            </section>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
