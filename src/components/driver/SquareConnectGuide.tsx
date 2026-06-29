"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import type { SquareSetupDiagnostics } from "@/lib/square/setup-diagnostics";

type SquareConnectGuideProps = {
  diagnostics: SquareSetupDiagnostics;
  reconnect?: boolean;
};

export function SquareConnectGuide({ diagnostics, reconnect = false }: SquareConnectGuideProps) {
  const [sandboxReady, setSandboxReady] = useState(false);
  const isSandbox = diagnostics.environment === "sandbox";
  const canContinue = diagnostics.readyToConnect && (!isSandbox || sandboxReady);
  const authorizeHref = reconnect
    ? "/api/square/oauth/authorize?reconnect=1"
    : "/api/square/oauth/authorize";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/driver/settings/integrations"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to integrations
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {reconnect ? "Reconnect Square" : "Connect Square"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Follow the steps below before continuing to Square. Skipping the sandbox step is the most
          common reason the Square page appears blank.
        </p>
      </div>

      {!diagnostics.readyToConnect && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Square is not ready to connect yet</p>
              <p className="mt-1 opacity-90">
                Fix the configuration issues below in Vercel, redeploy production, then return here.
              </p>
            </div>
          </div>
          <ul className="list-disc space-y-2 pl-5">
            {diagnostics.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-dark-elevated space-y-5">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Step 1 — Square redirect URL</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            In{" "}
            <a
              href="https://developer.squareup.com/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand hover:underline"
            >
              Square Developer Dashboard
            </a>
            , open your app → OAuth, and add this redirect URL exactly:
          </p>
          <code className="mt-3 block overflow-x-auto rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-800 dark:bg-white/5 dark:text-gray-200">
            {diagnostics.redirectUri}
          </code>
        </div>

        {isSandbox && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Step 2 — Open Sandbox Seller Dashboard (required)
            </p>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-amber-900/90 dark:text-amber-100/90">
              <li>
                Go to{" "}
                <a
                  href="https://developer.squareup.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  developer.squareup.com/apps
                </a>
              </li>
              <li>Make sure the dashboard toggle is set to Sandbox</li>
              <li>Open your Sparkride application</li>
              <li>Under Sandbox test accounts, click Open on a test seller account</li>
              <li>Keep that Square tab open, then come back here</li>
            </ol>
            <label className="mt-4 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-100">
              <input
                type="checkbox"
                checked={sandboxReady}
                onChange={(e) => setSandboxReady(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-amber-300"
              />
              <span>I have the Sandbox Seller Dashboard open in another browser tab</span>
            </label>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {isSandbox ? "Step 3" : "Step 2"} — Continue to Square
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Approve all requested permissions, including Orders access, so customers can pay online.
          </p>
          {canContinue ? (
            <a
              href={authorizeHref}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Continue to Square
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-gray-500"
            >
              Continue to Square
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 space-y-1">
        <p>
          Environment: <strong>{diagnostics.environment}</strong>
        </p>
        {diagnostics.applicationId.configured && (
          <p>
            Application ID: {diagnostics.applicationId.prefix}…{diagnostics.applicationId.last4}
          </p>
        )}
      </div>
    </div>
  );
}
