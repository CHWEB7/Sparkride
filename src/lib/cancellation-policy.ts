import { getSiteUrl } from "@/lib/site-url";

/** Per 15 minutes after included airport waiting time. Override in Vercel: NEXT_PUBLIC_AIRPORT_WAITING_FEE_PER_15_MIN */
export function airportWaitingFeePer15Min(): number {
  const raw = process.env.NEXT_PUBLIC_AIRPORT_WAITING_FEE_PER_15_MIN;
  const parsed = raw ? Number(raw) : 15;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15;
}

export function cancellationPolicyPath(): string {
  return "/cancellation";
}

export function cancellationPolicyUrl(): string {
  return `${getSiteUrl()}${cancellationPolicyPath()}`;
}

export const CANCELLATION_POLICY_TITLE =
  "Airport Transfer Cancellation & Delays Policy";
