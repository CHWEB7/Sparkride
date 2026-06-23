"use client";

import type { PaymentStatus } from "@prisma/client";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  canPayOnline,
  showPaymentStatus,
} from "@/lib/payment-status";

type BookingTripPaymentProps = {
  reference: string;
  status: string;
  paymentStatus: PaymentStatus;
  squarePaymentLinkUrl?: string | null;
  amountDue?: number | null;
  estimatedPrice?: number | null;
};

export function BookingTripPaymentActions({
  reference,
  status,
  paymentStatus,
  squarePaymentLinkUrl,
  amountDue,
  estimatedPrice,
}: BookingTripPaymentProps) {
  if (!showPaymentStatus({ status, paymentStatus, squarePaymentLinkUrl })) {
    return null;
  }

  const fare = amountDue ?? estimatedPrice;
  const payOnline = canPayOnline({ status, paymentStatus, squarePaymentLinkUrl });

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PAYMENT_STATUS_COLORS[paymentStatus]}`}
      >
        {PAYMENT_STATUS_LABELS[paymentStatus]}
      </span>
      {fare != null && paymentStatus !== "PAID" && (
        <span className="text-xs text-muted">£{fare}</span>
      )}
      {payOnline && squarePaymentLinkUrl && (
        <a
          href={squarePaymentLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
        >
          Pay now
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
      <Link
        href={`/booking/${reference}`}
        onClick={(e) => e.stopPropagation()}
        className="text-xs font-medium text-brand hover:underline"
      >
        View booking
      </Link>
    </div>
  );
}
