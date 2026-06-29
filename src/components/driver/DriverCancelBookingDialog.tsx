"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type CancelTarget = {
  id: string;
  reference: string;
  customerName: string;
  pickupDate: string;
};

type DriverCancelBookingDialogProps = {
  open: boolean;
  targets: CancelTarget[];
  acting: boolean;
  onClose: () => void;
  onConfirm: (cancellationReason: string) => void;
};

export function DriverCancelBookingDialog({
  open,
  targets,
  acting,
  onClose,
  onConfirm,
}: DriverCancelBookingDialogProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("details");
      setReason("");
      setError(null);
    }
  }, [open]);

  if (!open || targets.length === 0) return null;

  const trimmedReason = reason.trim();
  const count = targets.length;
  const single = targets[0]!;

  function handleContinue() {
    if (trimmedReason.length < 10) {
      setError("Please enter cancellation details (at least 10 characters).");
      return;
    }
    if (trimmedReason.length > 1000) {
      setError("Cancellation details must be under 1000 characters.");
      return;
    }
    setError(null);
    setStep("confirm");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={acting ? undefined : onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-booking-title"
        className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-xl ${
          isLight
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-dark-elevated"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={acting}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "details" ? (
          <>
            <div className="mb-4 flex items-start gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2
                  id="cancel-booking-title"
                  className={`text-lg font-semibold ${isLight ? "text-gray-900" : "text-white"}`}
                >
                  Cancel {count === 1 ? "ride" : `${count} rides`}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  The customer will receive an email with your cancellation details.
                </p>
              </div>
            </div>

            {count === 1 ? (
              <div
                className={`mb-4 rounded-xl p-4 text-sm ${
                  isLight ? "bg-gray-50 text-gray-700" : "bg-white/5 text-gray-300"
                }`}
              >
                <p className="font-semibold">{single.reference}</p>
                <p className="mt-1">{single.customerName}</p>
                <p className="mt-1 text-muted">
                  {new Date(single.pickupDate).toLocaleString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/London",
                  })}
                </p>
              </div>
            ) : (
              <div
                className={`mb-4 rounded-xl p-4 text-sm ${
                  isLight ? "bg-gray-50 text-gray-700" : "bg-white/5 text-gray-300"
                }`}
              >
                <p className="font-semibold">{count} bookings selected</p>
                <p className="mt-1 text-muted">
                  {targets.map((t) => t.reference).join(", ")}
                </p>
              </div>
            )}

            <label className="block text-sm font-medium dark:text-white">
              Cancellation details
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                rows={4}
                placeholder="Explain why this trip is being cancelled. This message is sent to the customer."
                className={`mt-2 w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none ${
                  isLight
                    ? "border-gray-200 bg-white text-gray-900 focus:border-red-400"
                    : "border-white/10 bg-white/5 text-white focus:border-red-400"
                }`}
              />
            </label>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
                  isLight
                    ? "border border-gray-200 text-gray-700"
                    : "border border-white/10 text-gray-300"
                }`}
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-start gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isLight ? "text-gray-900" : "text-white"}`}>
                  Do you really want to cancel {count === 1 ? "this ride" : "these rides"}?
                </h2>
                <p className="mt-1 text-sm text-muted">
                  This cannot be undone. The customer will be notified immediately.
                </p>
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 text-sm ${
                isLight
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-red-500/30 bg-red-500/10 text-red-100"
              }`}
            >
              <p className="font-semibold">Your cancellation message</p>
              <p className="mt-2 whitespace-pre-wrap">{trimmedReason}</p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep("details")}
                disabled={acting}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                  isLight
                    ? "border border-gray-200 text-gray-700"
                    : "border border-white/10 text-gray-300"
                }`}
              >
                Go back
              </button>
              <button
                type="button"
                onClick={() => onConfirm(trimmedReason)}
                disabled={acting}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {acting && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, cancel {count === 1 ? "ride" : "rides"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
