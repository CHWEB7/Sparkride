"use client";

import { CustomerPortal } from "@/components/customer/CustomerPortal";
import { SiteContainer } from "@/components/SiteContainer";
import type { CustomerProfile } from "@/lib/customer";

export function BookPageContent({ profile }: { profile: CustomerProfile }) {
  return (
    <SiteContainer>
      <CustomerPortal profile={profile} />
    </SiteContainer>
  );
}
