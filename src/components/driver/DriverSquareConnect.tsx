"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import type { DriverSquareStatus } from "@/lib/square/driver-status";

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
  permissions_missing:
    "Square connected but payment permissions were not granted. Tap Reconnect Square and approve all permissions, including Orders access.",
  not_configured:
    "Square credentials are missing in Vercel. Add SQUARE_APPLICATION_ID and SQUARE_APPLICATION_SECRET, then redeploy production.",
  authorize_failed:
    "Sparkride could not start the Square authorization flow. Use the Connect Square guide and try again.",
};

function squareErrorHelp(reason: string | null): string | null {
  if (!reason) return null;
  return SQUARE_ERROR_HELP[reason] ?? null;
}

export function DriverSquareConnect({
  initialStatus,
  theme: themeProp,
}: {
  initialStatus: DriverSquareStatus | null;
  theme?: "dark" | "light";
}) {
  const { theme: contextTheme } = useTheme();
  const theme = themeProp ?? contextTheme;
  const isLight = theme === "light";
  const searchParams = useSearchParams();
  const squareParam = searchParams.get("square");
  const squareReason = searchParams.get("reason");
  const squareDetail = searchParams.get("detail");
  const status = initialStatus;

  const cardClass = isLight
    ? "rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    : "rounded-xl border border-white/10 bg-dark-elevated p-5";

  const titleClass = isLight ? "font-semibold text-gray-900" : "font-semibold text-white";
  const bodyClass = isLight ? "text-sm text-gray-600" : "text-sm text-gray-300";
  const mutedClass = isLight ? "text-xs text-gray-500" : "text-xs text-gray-400";

  const connectBtnClass = isLight
    ? "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 shrink-0"
    : "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0";

  if (!status?.configured) {
    return (
      <div
        className={
          isLight
            ? "rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
            : "rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100"
        }
      >
        Square payments are not configured on this site yet. Ask your administrator to add Square
        credentials.
      </div>
    );
  }

  const oauthError =
    squareParam === "error" ? (
      <div
        className={
          isLight
            ? "mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 space-y-2"
            : "mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100 space-y-2"
        }
      >
        <p>Square connection failed. Please try again or contact support.</p>
        {squareReason && <p className="text-xs opacity-80">Reason: {squareReason.replace(/_/g, " ")}</p>}
        {squareErrorHelp(squareReason) && <p className="text-xs">{squareErrorHelp(squareReason)}</p>}
        {squareDetail && <p className="text-xs opacity-80">{squareDetail}</p>}
      </div>
    ) : squareParam === "no_location" ? (
      <div
        className={
          isLight
            ? "mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            : "mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100"
        }
      >
        Square connected but no active location was found. Add a location in your Square Dashboard
        and reconnect.
      </div>
    ) : squareParam === "connected" ? (
      <div
        className={
          isLight
            ? "mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
            : "mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100"
        }
      >
        Square connected successfully. Customers can now pay online when you accept bookings.
      </div>
    ) : squareParam === "permissions_missing" ? (
      <div
        className={
          isLight
            ? "mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2"
            : "mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100 space-y-2"
        }
      >
        <p>Square is linked but payment permissions are incomplete.</p>
        {squareDetail && <p className="text-xs opacity-90">{squareDetail}</p>}
        <p className="text-xs opacity-90">
          Tap <strong>Reconnect Square</strong> below and approve all requested permissions.
        </p>
      </div>
    ) : squareParam === "disconnected" ? (
      <div
        className={
          isLight
            ? "mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
            : "mb-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300"
        }
      >
        Square disconnected. Connect again to collect online payments.
      </div>
    ) : null;

  return (
    <div className={cardClass}>
      {oauthError}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            <Image
              src="/images/integrations/square.svg"
              alt="Square"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={titleClass}>Square</p>
              {status.connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Enabled
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-400">
                  Not connected
                </span>
              )}
            </div>
            <p className={`${bodyClass} mt-1 max-w-xl`}>
              {status.connected
                ? "Customers receive a secure Square payment link when you accept bookings. Payments go directly to your Square account."
                : "Link your Square merchant account to collect fares online after you accept bookings."}
            </p>
            {status.connected && status.connectedAt && (
              <p className={`${mutedClass} mt-2`}>
                Connected {new Date(status.connectedAt).toLocaleDateString("en-GB")}
              </p>
            )}
            {status.connected && status.checkoutPermissionsOk === false && (
              <p
                className={
                  isLight
                    ? "mt-3 max-w-xl text-sm leading-relaxed text-amber-800"
                    : "mt-3 max-w-xl text-sm leading-relaxed text-amber-200"
                }
              >
                {status.checkoutPermissionsError ??
                  "Payment permissions are missing. Reconnect Square to enable online checkout."}
              </p>
            )}
            {!status.connected && status.environment === "sandbox" && (
              <p className={`${mutedClass} mt-3 max-w-xl leading-relaxed`}>
                Sandbox mode: open your Sandbox Seller Dashboard from developer.squareup.com before
                connecting.
              </p>
            )}
            {!status.connected &&
              status.credentialsMatchEnvironment === false &&
              status.setupHints && (
                <ul className={`${mutedClass} mt-3 list-disc space-y-1 pl-4`}>
                  {status.setupHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              )}
          </div>
        </div>

        {status.connected ? (
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="/driver/settings/integrations/connect?reconnect=1"
              className={connectBtnClass}
            >
              Reconnect Square
              <ExternalLink className="h-4 w-4" />
            </a>
            {status.checkoutPermissionsOk !== false && (
              <span className={`inline-flex items-center justify-center gap-1 text-xs font-medium ${mutedClass}`}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Payment permissions OK
              </span>
            )}
          </div>
        ) : (
          <a href="/driver/settings/integrations/connect" className={connectBtnClass}>
            Connect Square
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
