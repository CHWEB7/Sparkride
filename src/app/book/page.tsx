import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BookPageScrollLock } from "@/components/booking/BookPageScrollLock";
import { ThirdPartyBookingForm } from "@/components/booking/ThirdPartyBookingForm";
import { cancellationPolicyPath } from "@/lib/cancellation-policy";

export const metadata: Metadata = {
  title: "Book a transfer | Sparkride",
  description:
    "Book your Sparkride airport transfer online. Live pricing, vehicle options, and instant quotes.",
};

export default function BookPage() {
  return (
    <div className="fixed inset-0 z-0 flex flex-col overflow-hidden bg-app-bg dark:bg-dark">
      <BookPageScrollLock />
      <Header />
      <main className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-3 pb-6 pt-[calc(3.5rem+1.75rem)] sm:px-4 sm:pt-[calc(4.25rem+2rem)] lg:items-center lg:pb-4 lg:pt-[calc(4.25rem+1.25rem)]">
        <div className="flex w-full max-w-[760px] flex-col items-center">
          <ThirdPartyBookingForm />
          <Link
            href={cancellationPolicyPath()}
            className="mt-4 text-sm font-medium text-muted transition-colors hover:text-brand dark:hover:text-brand-end"
          >
            Cancellation &amp; delays policy
          </Link>
        </div>
      </main>
    </div>
  );
}
