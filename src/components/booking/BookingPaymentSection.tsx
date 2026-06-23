import type { PaymentStatus } from "@prisma/client";
import Link from "next/link";
import { CreditCard, CheckCircle2, ExternalLink } from "lucide-react";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/payment-status";

type BookingPaymentSectionProps = {
  reference: string;
  paymentStatus: PaymentStatus;
  amountDue?: number | null;
  estimatedPrice?: number | null;
  paymentLinkUrl?: string | null;
  paidAt?: Date | null;
};

export function BookingPaymentSection({
  paymentStatus,
  amountDue,
  estimatedPrice,
  paymentLinkUrl,
  paidAt,
}: BookingPaymentSectionProps) {
  const fare = amountDue ?? estimatedPrice;

  return (
    <div className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-dark-elevated p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand" />
          <h2 className="text-lg font-semibold dark:text-white">Payment</h2>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${PAYMENT_STATUS_COLORS[paymentStatus]}`}
        >
          {PAYMENT_STATUS_LABELS[paymentStatus]}
        </span>
      </div>

      {fare != null && (
        <p className="mt-4 text-sm text-muted">
          Fare: <span className="font-semibold text-dark dark:text-white">£{fare}</span>
        </p>
      )}

      {paymentStatus === "AWAITING_PAYMENT" && paymentLinkUrl && (
        <div className="mt-5 space-y-3">
          <a
            href={paymentLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-brand-gradient text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Pay now
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-xs text-muted leading-relaxed">
            You will complete payment on Square&apos;s secure checkout. Sparkride does not store your card
            details. Payments are processed by Square to your driver&apos;s merchant account.
          </p>
        </div>
      )}

      {paymentStatus === "PAID" && (
        <div className="mt-4 flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Payment received
            {paidAt ? ` on ${paidAt.toLocaleDateString("en-GB")}` : ""}. Thank you.
          </span>
        </div>
      )}

      {paymentStatus === "NOT_REQUIRED" && (
        <p className="mt-4 text-sm text-muted leading-relaxed">
          Online payment is not available for this booking yet. View your booking here anytime — if your
          driver connects Square, a pay link will appear. Otherwise your driver will confirm payment
          arrangements directly.
        </p>
      )}

      <p className="mt-4 text-xs text-muted">
        Questions about payment?{" "}
        <Link href="/payments" className="text-brand hover:underline">
          How payments work
        </Link>
      </p>
    </div>
  );
}
