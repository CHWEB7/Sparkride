"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";

type SquareStatus = {
  configured: boolean;
  connected: boolean;
  merchantId?: string | null;
  locationId?: string | null;
  connectedAt?: string | null;
};

export function DriverSquareConnect() {
  const searchParams = useSearchParams();
  const squareParam = searchParams.get("square");
  const [status, setStatus] = useState<SquareStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/square/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ configured: false, connected: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center gap-3 text-gray-300">
        <Loader2 className="w-5 h-5 animate-spin" />
        Checking Square connection…
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100 text-sm">
        Square payments are not configured on this site yet. Ask your administrator to add Square credentials.
      </div>
    );
  }

  if (squareParam === "error") {
    return (
      <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-100 text-sm">
        Square connection failed. Please try again or contact support.
      </div>
    );
  }

  if (squareParam === "no_location") {
    return (
      <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100 text-sm">
        Square connected but no active location was found. Add a location in your Square Dashboard and reconnect.
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="mb-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Square connected</p>
            <p className="mt-1 text-sm text-gray-300">
              When you confirm a booking, customers receive a secure Square payment link for the full fare.
              Payments go directly to your Square account.
            </p>
            {status.connectedAt && (
              <p className="mt-2 text-xs text-gray-400">
                Connected {new Date(status.connectedAt).toLocaleDateString("en-GB")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-end" />
            Connect Square to accept online payments
          </p>
          <p className="mt-2 text-sm text-gray-400 max-w-xl">
            Link your Square merchant account once. After you confirm bookings, customers pay on Square&apos;s
            secure checkout — Sparkride never sees card details.
          </p>
        </div>
        <a
          href="/api/square/oauth/authorize"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
        >
          Connect Square
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
