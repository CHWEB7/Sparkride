"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookingPageLoader } from "@/components/BookingPageLoader";
import { CustomerPortal } from "@/components/customer/CustomerPortal";
import { SiteContainer } from "@/components/SiteContainer";
import type { CustomerProfile } from "@/lib/customer";

const INTRO_SEEN_KEY = "sparkride-booking-intro-seen";

export function BookPageContent({ profile }: { profile: CustomerProfile }) {
  const [introState, setIntroState] = useState<"checking" | "show" | "skip">("checking");

  useEffect(() => {
    const seen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    setIntroState(seen ? "skip" : "show");
  }, []);

  function handleIntroComplete() {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    setIntroState("skip");
  }

  if (introState === "checking" || introState === "skip") {
    const portal = (
      <SiteContainer>
        <CustomerPortal profile={profile} />
      </SiteContainer>
    );

    if (introState === "checking") {
      return portal;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {portal}
      </motion.div>
    );
  }

  return <BookingPageLoader onComplete={handleIntroComplete} />;
}
