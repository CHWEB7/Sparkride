"use client";

import { CustomerPortal } from "@/components/customer/CustomerPortal";
import type { CustomerProfile } from "@/lib/customer";

export function BookPageContent({ profile }: { profile: CustomerProfile }) {
  return <CustomerPortal profile={profile} />;
}
