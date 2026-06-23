import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { CreditCard, ShieldCheck, Mail, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment options | Sparkride",
  description:
    "How Sparkride online payments work with Square — secure hosted checkout after your driver confirms your booking.",
};

export default function PaymentsPage() {
  return (
    <>
      <Header />
      <main className="bg-app-bg dark:bg-dark">
        <SiteContainer className="py-16 sm:py-20 lg:py-24 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Payments
          </p>
          <h1 className="font-display mt-3 text-4xl sm:text-5xl dark:text-white leading-[1.05] tracking-[-0.02em]">
            Pay securely after confirmation
          </h1>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            When your driver confirms your booking, you may receive a link to pay the full fare online.
            Payments are processed by Square on a secure hosted checkout page — Sparkride never sees or
            stores your card details.
          </p>

          <div className="mt-12 space-y-6">
            <section className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-dark-elevated p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <CreditCard className="w-6 h-6 text-brand shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">How it works</h2>
                  <ol className="mt-4 space-y-3 text-muted leading-relaxed list-decimal list-inside">
                    <li>You book online and receive a reference number.</li>
                    <li>Your driver confirms the booking.</li>
                    <li>You receive a payment link by email and on your booking page.</li>
                    <li>You pay on Square&apos;s secure checkout. Funds go to your driver&apos;s Square account.</li>
                  </ol>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-dark-elevated p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-brand shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">Security & liability</h2>
                  <ul className="mt-4 space-y-3 text-muted leading-relaxed">
                    <li>Sparkride is not a payment processor and does not handle card data.</li>
                    <li>Card payments are processed by Square, a PCI-certified provider.</li>
                    <li>Checkout opens on Square&apos;s website — not an embedded card form on Sparkride.</li>
                    <li>Refunds and chargebacks are handled between you and your driver via Square.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-dark-elevated p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-brand shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">Where to pay</h2>
                  <p className="mt-4 text-muted leading-relaxed">
                    After confirmation, use the <strong className="text-dark dark:text-white">Pay securely with Square</strong>{" "}
                    button in your confirmation email or on your booking page at{" "}
                    <code className="text-sm bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">/booking/your-reference</code>.
                  </p>
                  <p className="mt-3 text-sm text-muted flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    The link opens Square&apos;s hosted checkout in your browser.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <AnimatedGradientButton href="/book">Book a transfer</AnimatedGradientButton>
            <Link
              href="/my-bookings"
              className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              My bookings
            </Link>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
