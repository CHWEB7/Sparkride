"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookingPageLoader } from "@/components/BookingPageLoader";
import { BookingForm } from "@/components/BookingForm";
import { PageHeader } from "@/components/PageHeader";
import { SiteContainer } from "@/components/SiteContainer";
import type { CustomerProfile } from "@/lib/customer";

export function BookPageContent({ profile }: { profile: CustomerProfile }) {
  const [ready, setReady] = useState(false);

  return (
    <>
      {!ready && <BookingPageLoader onComplete={() => setReady(true)} />}

      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <SiteContainer>
            <PageHeader
              title="Book your transfer"
              description="Step through each section — we'll build your quote as you go."
            />
            <BookingForm profile={profile} />
          </SiteContainer>
        </motion.div>
      )}
    </>
  );
}
