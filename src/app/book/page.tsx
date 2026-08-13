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
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden pt-14 sm:pt-[4.25rem]">
        <ThirdPartyBookingForm className="min-h-0 flex-1 rounded-none border-0 shadow-none" />
      </main>
    </div>
  );
}
