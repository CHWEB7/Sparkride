"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CustomerPortal } from "@/components/customer/CustomerPortal";
import { loadBookingDraft, loadBookingDraftSource } from "@/lib/booking-wizard/draft";
import type { CustomerProfile } from "@/lib/customer";

function BookPageContentInner({ profile }: { profile: CustomerProfile | null }) {
  const searchParams = useSearchParams();
  const fromAi = searchParams.get("from") === "ai";
  const [openAiWizard, setOpenAiWizard] = useState(false);

  useEffect(() => {
    if (fromAi && loadBookingDraftSource() === "ai" && loadBookingDraft()) {
      setOpenAiWizard(true);
    }
  }, [fromAi]);

  return (
    <CustomerPortal profile={profile} initialWizardFromAi={openAiWizard} />
  );
}

export function BookPageContent({ profile }: { profile: CustomerProfile | null }) {
  return (
    <Suspense fallback={null}>
      <BookPageContentInner profile={profile} />
    </Suspense>
  );
}
