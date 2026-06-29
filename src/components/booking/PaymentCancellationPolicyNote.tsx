import Link from "next/link";
import { cancellationPolicyPath } from "@/lib/cancellation-policy";

export function PaymentCancellationPolicyNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      By paying, you agree to our{" "}
      <Link href={cancellationPolicyPath()} className="font-medium text-brand hover:underline">
        Cancellation &amp; Delays Policy
      </Link>
      , including the 48-hour cancellation and refund terms.
    </p>
  );
}
