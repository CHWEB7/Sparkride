"use client";

import { useEffect, useState } from "react";
import { AccordionBookingForm } from "@/components/booking/AccordionBookingForm";
import { BookingPageHeader } from "@/components/booking/BookingPageHeader";
import type { CustomerProfile } from "@/lib/customer";

export function BookPageContent({ profile }: { profile: CustomerProfile | null }) {
  const [currentProfile, setCurrentProfile] = useState<CustomerProfile | null>(profile);

  useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark">
      <BookingPageHeader profile={currentProfile} onProfileChange={setCurrentProfile} />

      <div className="border-b border-gray-200 bg-[#f3f4f6] dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-7">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Make a reservation
          </h1>
          <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
            Complete each section below. Review your quote before signing in.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <AccordionBookingForm profile={currentProfile} onProfileChange={setCurrentProfile} />
      </main>
    </div>
  );
}
