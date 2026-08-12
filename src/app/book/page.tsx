import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { ThirdPartyBookingForm } from "@/components/booking/ThirdPartyBookingForm";

export const metadata: Metadata = {
  title: "Book a transfer | Sparkride",
  description:
    "Book your Sparkride airport transfer online. Live pricing, vehicle options, and instant quotes.",
};

export default function BookPage() {
  return (
    <>
      <Header />
      <main className="bg-app-bg dark:bg-dark">
        <SiteContainer className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Online booking
            </p>
            <h1 className="mt-2 sm:mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.02em] dark:text-white">
              Book your transfer
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
              Enter your journey details below for a live quote and to complete your booking.
            </p>
          </div>

          <div className="mx-auto mt-8 sm:mt-12 max-w-3xl">
            <ThirdPartyBookingForm />
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
