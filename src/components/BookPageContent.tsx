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
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-dark">
      <BookingPageHeader profile={currentProfile} onProfileChange={setCurrentProfile} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Make a reservation
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Complete each section below. Review your quote before signing in.
          </p>
        </div>

        <AccordionBookingForm profile={currentProfile} onProfileChange={setCurrentProfile} />
      </main>
    </div>
  );
}
