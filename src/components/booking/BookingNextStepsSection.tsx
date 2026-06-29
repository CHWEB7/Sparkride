import { ClipboardCheck, CreditCard, Mail, ShieldCheck } from "lucide-react";

type BookingNextStepsSectionProps = {
  status: string;
  paymentStatus: string;
};

type Step = {
  icon: typeof ClipboardCheck;
  title: string;
  description: string;
  complete?: boolean;
};

function getSteps(status: string, paymentStatus: string): Step[] {
  const paid = paymentStatus === "PAID" || status === "CONFIRMED";

  if (paid) {
    return [
      {
        icon: ShieldCheck,
        title: "Trip confirmed",
        description:
          "Your driver has accepted your booking and payment has been received. We look forward to seeing you on travel day.",
        complete: true,
      },
    ];
  }

  if (status === "ACCEPTED") {
    return [
      {
        icon: ClipboardCheck,
        title: "Driver review complete",
        description: "Your driver has reviewed and accepted your booking request.",
        complete: true,
      },
      {
        icon: Mail,
        title: "Check your email",
        description:
          "We have sent you an email with a secure link to pay the full fare online. You can also use the Pay now button above.",
      },
      {
        icon: CreditCard,
        title: "Complete payment",
        description:
          "Your trip is not fully booked until payment has been made. Please pay before your travel date to secure your journey.",
      },
    ];
  }

  return [
    {
      icon: ClipboardCheck,
      title: "Driver review",
      description:
        "Your assigned driver will review your trip details and confirm they can take the booking.",
    },
    {
      icon: Mail,
      title: "Payment email",
      description:
        "Once your driver has accepted the booking, you will receive an email with a secure link to make the full payment.",
    },
    {
      icon: CreditCard,
      title: "Confirm your trip",
      description:
        "Trips are not fully booked until payment has been made. Please complete payment after acceptance to secure your journey.",
    },
  ];
}

export function BookingNextStepsSection({
  status,
  paymentStatus,
}: BookingNextStepsSectionProps) {
  const steps = getSteps(status, paymentStatus);
  const paid = paymentStatus === "PAID" || status === "CONFIRMED";

  return (
    <div className="mb-6 rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-dark-elevated p-5 sm:p-6">
      <h2 className="text-lg font-semibold dark:text-white">
        {paid ? "You are all set" : "What happens next"}
      </h2>
      {!paid && (
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Your booking request has been received. Here is how we confirm your trip.
        </p>
      )}

      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  step.complete
                    ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                    : "bg-brand-light text-brand dark:bg-brand/10"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  {!paid && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Step {index + 1}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold dark:text-white">{step.title}</h3>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
