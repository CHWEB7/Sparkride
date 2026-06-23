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
  environment?: "sandbox" | "production";
  oauthHost?: string;
  credentialsMatchEnvironment?: boolean;
  credentialMismatch?: string | null;
  applicationId?: {
    configured: boolean;
    prefix: string;
    last4: string;
    looksSandbox: boolean;
    looksProduction: boolean;
  };
  setupHints?: string[];
};

const SQUARE_ERROR_HELP: Record<string, string> = {
  invalid_state:
    "Your OAuth session expired or could not be verified. Click Connect Square again in one go. If it keeps failing, set SQUARE_OAUTH_STATE_SECRET in Vercel and redeploy.",
  token_exchange_failed:
    "Square rejected the token exchange. The Application secret in Vercel is usually wrong — copy it from the OAuth page (sandbox-sq0csp-…), not the Sandbox access token on the Credentials tab.",
  wrong_application_secret:
    "SQUARE_APPLICATION_SECRET is not the OAuth Application secret. Update it in Vercel from Square → OAuth, then redeploy.",
  missing_code_or_state:
    "Square did not return an authorization code. Try connecting again without using the browser back button.",
  save_failed:
    "Sparkride could not save your Square tokens. The database may need the payment-columns migration.",
  access_denied: "You declined Square permissions. Click Connect Square and approve the requested access.",
};

function squareErrorHelp(reason: string | null): string | null {
  if (!reason) return null;
  return SQUARE_ERROR_HELP[reason] ?? null;
}

export function DriverSquareConnect() {
  const searchParams = useSearchParams();
  const squareParam = searchParams.get("square");
  const squareReason = searchParams.get("reason");
  const squareDetail = searchParams.get("detail");
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
      <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-100 text-sm space-y-3">
        <p>Square connection failed. Please try again or contact support.</p>
        {squareReason && (
          <p className="text-xs text-red-200/80">Reason: {squareReason.replace(/_/g, " ")}</p>
        )}
        {squareErrorHelp(squareReason) && (
          <p className="text-xs text-red-200/90">{squareErrorHelp(squareReason)}</p>
        )}
        {squareDetail && <p className="text-xs text-red-200/80">{squareDetail}</p>}
        {!squareDetail && status?.credentialMismatch && (
          <p className="text-xs text-red-200/80">{status.credentialMismatch}</p>
        )}
        {status?.setupHints && status.setupHints.length > 0 && (
          <ul className="list-disc pl-5 space-y-1 text-red-100/90">
            {status.setupHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        )}
        <a
          href="/api/square/oauth/authorize"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors shrink-0"
        >
          Try again
        </a>
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
          {status.environment === "sandbox" && (
            <p className="mt-3 text-xs text-amber-200/90 leading-relaxed max-w-xl">
              Sandbox mode: open your Sandbox Seller Dashboard from{" "}
              <a
                href="https://developer.squareup.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-100"
              >
                developer.squareup.com
              </a>{" "}
              (Apps → test account → Open) in another tab, then connect here.
            </p>
          )}
          {status.credentialsMatchEnvironment === false && status.setupHints && (
            <ul className="mt-3 text-xs text-amber-200/90 list-disc pl-5 space-y-1 max-w-xl">
              {status.setupHints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          )}
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
