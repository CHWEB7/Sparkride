"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

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

export function DriverSquareConnect({ theme: themeProp }: { theme?: "dark" | "light" }) {
  const { theme: contextTheme } = useTheme();
  const theme = themeProp ?? contextTheme;
  const isLight = theme === "light";
  const searchParams = useSearchParams();
  const squareParam = searchParams.get("square");
  const squareReason = searchParams.get("reason");
  const squareDetail = searchParams.get("detail");
  const [status, setStatus] = useState<SquareStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const cardClass = isLight
    ? "rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    : "mb-8 rounded-2xl border border-white/10 bg-white/5 p-5";

  const loadingClass = isLight
    ? "rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-3 text-gray-600 shadow-sm"
    : "mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center gap-3 text-gray-300";

  const warnClass = isLight
    ? "rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 text-sm"
    : "mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100 text-sm";

  const errorClass = isLight
    ? "rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 text-sm space-y-3"
    : "mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-100 text-sm space-y-3";

  const successClass = isLight
    ? "rounded-xl border border-emerald-200 bg-emerald-50 p-5"
    : "mb-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5";

  const titleClass = isLight ? "font-semibold text-gray-900" : "font-semibold text-white";
  const bodyClass = isLight ? "mt-1 text-sm text-gray-600" : "mt-1 text-sm text-gray-300";
  const mutedClass = isLight ? "mt-2 text-xs text-gray-500" : "mt-2 text-xs text-gray-400";
  const secondaryClass = isLight ? "mt-2 text-sm text-gray-600" : "mt-2 text-sm text-gray-400";

  const connectBtnClass = isLight
    ? "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors shrink-0"
    : "inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shrink-0";

  const retryBtnClass = isLight
    ? "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors shrink-0"
    : "inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors shrink-0";

  useEffect(() => {
    fetch("/api/square/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ configured: false, connected: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={loadingClass}>
        <Loader2 className="w-5 h-5 animate-spin" />
        Checking Square connection…
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className={warnClass}>
        Square payments are not configured on this site yet. Ask your administrator to add Square credentials.
      </div>
    );
  }

  if (squareParam === "error") {
    return (
      <div className={errorClass}>
        <p>Square connection failed. Please try again or contact support.</p>
        {squareReason && (
          <p className={isLight ? "text-xs text-red-700" : "text-xs text-red-200/80"}>
            Reason: {squareReason.replace(/_/g, " ")}
          </p>
        )}
        {squareErrorHelp(squareReason) && (
          <p className={isLight ? "text-xs text-red-800" : "text-xs text-red-200/90"}>
            {squareErrorHelp(squareReason)}
          </p>
        )}
        {squareDetail && (
          <p className={isLight ? "text-xs text-red-700" : "text-xs text-red-200/80"}>{squareDetail}</p>
        )}
        {!squareDetail && status?.credentialMismatch && (
          <p className={isLight ? "text-xs text-red-700" : "text-xs text-red-200/80"}>
            {status.credentialMismatch}
          </p>
        )}
        {status?.setupHints && status.setupHints.length > 0 && (
          <ul className={`list-disc pl-5 space-y-1 ${isLight ? "text-red-800" : "text-red-100/90"}`}>
            {status.setupHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        )}
        <a href="/api/square/oauth/authorize" className={retryBtnClass}>
          Try again
        </a>
      </div>
    );
  }

  if (squareParam === "no_location") {
    return (
      <div className={warnClass}>
        Square connected but no active location was found. Add a location in your Square Dashboard and reconnect.
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className={successClass}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${isLight ? "text-emerald-600" : "text-green-400"}`} />
          <div>
            <p className={titleClass}>Square connected</p>
            <p className={bodyClass}>
              When you confirm a booking, customers receive a secure Square payment link for the full fare.
              Payments go directly to your Square account.
            </p>
            <p className={`${mutedClass} mt-2`}>
              If customers cannot pay and you see a permissions error, click Connect Square below again to
              approve updated permissions (including Orders read access).
            </p>
            {status.connectedAt && (
              <p className={mutedClass}>
                Connected {new Date(status.connectedAt).toLocaleDateString("en-GB")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className={`${titleClass} flex items-center gap-2`}>
            <CreditCard className={`w-5 h-5 ${isLight ? "text-emerald-600" : "text-brand-end"}`} />
            Connect Square to accept online payments
          </p>
          <p className={`${secondaryClass} max-w-xl`}>
            Link your Square merchant account once. After you confirm bookings, customers pay on Square&apos;s
            secure checkout — Sparkride never sees card details.
          </p>
          {status.environment === "sandbox" && (
            <p className={`mt-3 text-xs leading-relaxed max-w-xl ${isLight ? "text-amber-800" : "text-amber-200/90"}`}>
              Sandbox mode: open your Sandbox Seller Dashboard from{" "}
              <a
                href="https://developer.squareup.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                developer.squareup.com
              </a>{" "}
              (Apps → test account → Open) in another tab, then connect here.
            </p>
          )}
          {status.credentialsMatchEnvironment === false && status.setupHints && (
            <ul className={`mt-3 text-xs list-disc pl-5 space-y-1 max-w-xl ${isLight ? "text-amber-800" : "text-amber-200/90"}`}>
              {status.setupHints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          )}
        </div>
        <a href="/api/square/oauth/authorize" className={connectBtnClass}>
          Connect Square
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
