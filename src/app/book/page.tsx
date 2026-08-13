import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { BookPageScrollLock } from "@/components/booking/BookPageScrollLock";
import { ThirdPartyBookingForm } from "@/components/booking/ThirdPartyBookingForm";

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
      <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 pb-3 pt-[calc(3.5rem+0.75rem)] sm:px-4 sm:pb-4 sm:pt-[calc(4.25rem+1rem)]">
        <div className="flex h-full w-full max-w-7xl min-h-0 flex-col">
          <ThirdPartyBookingForm className="min-h-0 flex-1" />
        </div>
      </main>
    </div>
  );
}
