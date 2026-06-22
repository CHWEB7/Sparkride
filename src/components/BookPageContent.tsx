"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookingPageLoader } from "@/components/BookingPageLoader";
import { CustomerPortal } from "@/components/customer/CustomerPortal";
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
            <CustomerPortal profile={profile} />
          </SiteContainer>
        </motion.div>
      )}
    </>
  );
}
