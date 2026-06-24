import { NextResponse } from "next/server";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { prisma } from "@/lib/prisma";
import { isSquareConfigured, squareApplicationSecretMismatchMessage, squareCredentialMismatchMessage, squareCredentialsMatchEnvironment, squareOAuthRedirectUri } from "@/lib/square/config";
import { buildSquareAuthorizeUrl, createOAuthState } from "@/lib/square/oauth";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSquareConfigured()) {
    return NextResponse.json(
      { error: "Square payments are not configured on this site yet" },
      { status: 503 }
    );
  }

  if (!squareCredentialsMatchEnvironment()) {
    const message =
      squareCredentialMismatchMessage() ??
      "Square application credentials do not match SQUARE_ENVIRONMENT.";
    return NextResponse.redirect(
      `${getSiteUrl()}/driver/settings/integrations?square=error&reason=${encodeURIComponent("credential_mismatch")}&detail=${encodeURIComponent(message)}`
    );
  }

  const secretMismatch = squareApplicationSecretMismatchMessage();
  if (secretMismatch) {
    return NextResponse.redirect(
      `${getSiteUrl()}/driver/settings/integrations?square=error&reason=${encodeURIComponent("wrong_application_secret")}&detail=${encodeURIComponent(secretMismatch)}`
    );
  }

  const redirectUri = squareOAuthRedirectUri();
  const state = await createOAuthState(session.driverId, redirectUri);
  const url = buildSquareAuthorizeUrl(state, redirectUri);
  return NextResponse.redirect(url);
}
