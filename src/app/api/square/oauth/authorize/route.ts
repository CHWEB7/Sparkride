import { NextRequest, NextResponse } from "next/server";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import {
  isSquareConfigured,
  squareApplicationSecretMismatchMessage,
  squareCredentialMismatchMessage,
  squareCredentialsMatchEnvironment,
  squareOAuthRedirectUri,
} from "@/lib/square/config";
import { buildSquareAuthorizeUrl, createOAuthState } from "@/lib/square/oauth";
import { clearDriverSquareTokens } from "@/lib/square/driver-tokens";
import { getSiteUrl } from "@/lib/site-url";

function integrationsErrorRedirect(reason: string, detail?: string) {
  const params = new URLSearchParams({ square: "error", reason });
  if (detail) params.set("detail", detail.slice(0, 300));
  return NextResponse.redirect(
    `${getSiteUrl()}/driver/settings/integrations?${params.toString()}`
  );
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireDriverSessionWithMfa();
    if (!session) {
      const redirect = req.nextUrl.searchParams.get("reconnect") === "1"
        ? "/driver/settings/integrations/connect?reconnect=1"
        : "/driver/settings/integrations/connect";
      return NextResponse.redirect(
        `${getSiteUrl()}/driver/login?redirect=${encodeURIComponent(redirect)}`
      );
    }

    if (!isSquareConfigured()) {
      return integrationsErrorRedirect(
        "not_configured",
        "Square payments are not configured on this site yet."
      );
    }

    if (!squareCredentialsMatchEnvironment()) {
      const message =
        squareCredentialMismatchMessage() ??
        "Square application credentials do not match SQUARE_ENVIRONMENT.";
      return integrationsErrorRedirect("credential_mismatch", message);
    }

    const secretMismatch = squareApplicationSecretMismatchMessage();
    if (secretMismatch) {
      return integrationsErrorRedirect("wrong_application_secret", secretMismatch);
    }

    const reconnect = req.nextUrl.searchParams.get("reconnect") === "1";
    if (reconnect) {
      await clearDriverSquareTokens(session.driverId);
    }

    const redirectUri = squareOAuthRedirectUri();
    const state = await createOAuthState(session.driverId, redirectUri);
    const url = buildSquareAuthorizeUrl(state, redirectUri);
    return NextResponse.redirect(url, { status: 302 });
  } catch (error) {
    console.error("Square OAuth authorize failed:", error);
    const message = error instanceof Error ? error.message : "Could not start Square authorization";
    return integrationsErrorRedirect("authorize_failed", message);
  }
}
