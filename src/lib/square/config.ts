import { getSiteUrl } from "@/lib/site-url";

const PRODUCTION_URL = "https://sparkride-umber.vercel.app";

export const SQUARE_API_VERSION = "2024-11-20";

export function isSquareConfigured(): boolean {
  return Boolean(squareApplicationId() && squareApplicationSecret());
}

export function squareEnvironment(): "sandbox" | "production" {
  const raw = process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase();
  return raw === "production" ? "production" : "sandbox";
}

export function squareApplicationId(): string {
  return process.env.SQUARE_APPLICATION_ID?.trim() ?? "";
}

export function squareApplicationSecret(): string {
  return process.env.SQUARE_APPLICATION_SECRET?.trim() ?? "";
}

export function squareApplicationSecretDiagnostics(): {
  configured: boolean;
  prefix: string;
  last4: string;
  looksLikeOAuthSecret: boolean;
  looksLikeAccessToken: boolean;
} {
  const secret = squareApplicationSecret();
  if (!secret) {
    return {
      configured: false,
      prefix: "",
      last4: "",
      looksLikeOAuthSecret: false,
      looksLikeAccessToken: false,
    };
  }

  const looksLikeOAuthSecret =
    secret.startsWith("sq0csp-") ||
    secret.startsWith("sandbox-sq0csp-") ||
    secret.startsWith("sandbox-sq0csb-");

  const looksLikeAccessToken =
    secret.startsWith("EAAA") ||
    secret.startsWith("sandbox-sq0atb-") ||
    secret.startsWith("sq0atb-");

  return {
    configured: true,
    prefix: secret.slice(0, 16),
    last4: secret.slice(-4),
    looksLikeOAuthSecret,
    looksLikeAccessToken,
  };
}

export function squareApplicationSecretMismatchMessage(): string | null {
  const secret = squareApplicationSecret();
  if (!secret) return null;

  const { looksLikeOAuthSecret, looksLikeAccessToken, prefix, last4 } =
    squareApplicationSecretDiagnostics();

  if (looksLikeOAuthSecret) return null;

  if (looksLikeAccessToken) {
    return `SQUARE_APPLICATION_SECRET (${prefix}…${last4}) looks like a Square access token. Use the Application secret from developer.squareup.com → your app → OAuth (starts with sandbox-sq0csp- or sandbox-sq0csb-), not the Sandbox access token on the Credentials tab.`;
  }

  return `SQUARE_APPLICATION_SECRET (${prefix}…${last4}) does not look like a Square OAuth Application secret. Copy it from developer.squareup.com → your app → OAuth page, not the Credentials tab.`;
}

export function squareApplicationIdDiagnostics(): {
  configured: boolean;
  prefix: string;
  last4: string;
  looksSandbox: boolean;
  looksProduction: boolean;
} {
  const appId = squareApplicationId();
  if (!appId) {
    return {
      configured: false,
      prefix: "",
      last4: "",
      looksSandbox: false,
      looksProduction: false,
    };
  }

  return {
    configured: true,
    prefix: appId.slice(0, 12),
    last4: appId.slice(-4),
    looksSandbox: appId.startsWith("sandbox-"),
    looksProduction: appId.startsWith("sq0idp-") || appId.startsWith("sq0idb-"),
  };
}

export function squareConnectHost(): string {
  return squareEnvironment() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function squareOAuthAuthorizeUrl(): string {
  return `${squareConnectHost()}/oauth2/authorize`;
}

export function squareOAuthTokenUrl(): string {
  return `${squareConnectHost()}/oauth2/token`;
}

/** Canonical OAuth callback — must match Square Dashboard exactly; never use preview VERCEL_URL. */
export function squareOAuthRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (base) return `${base}/api/square/oauth/callback`;
  if (process.env.NODE_ENV === "production") {
    return `${PRODUCTION_URL}/api/square/oauth/callback`;
  }
  return "http://localhost:3000/api/square/oauth/callback";
}

/** Sandbox app IDs are prefixed with `sandbox-`; production IDs use `sq0idp-`. */
export function squareCredentialsMatchEnvironment(): boolean {
  const appId = squareApplicationId();
  if (!appId) return true;

  const isSandboxId = appId.startsWith("sandbox-");
  return squareEnvironment() === "sandbox" ? isSandboxId : !isSandboxId;
}

export function squareCredentialMismatchMessage(): string | null {
  if (!isSquareConfigured() || squareCredentialsMatchEnvironment()) return null;

  const env = squareEnvironment();
  const { prefix, last4 } = squareApplicationIdDiagnostics();

  if (env === "sandbox") {
    return `SQUARE_ENVIRONMENT is sandbox but SQUARE_APPLICATION_ID (${prefix}…${last4}) looks like a production ID. In developer.squareup.com, switch to Sandbox, open Credentials, and paste the sandbox application ID (starts with sandbox-).`;
  }

  return `SQUARE_ENVIRONMENT is production but SQUARE_APPLICATION_ID (${prefix}…${last4}) looks like a sandbox ID. Use production credentials or set SQUARE_ENVIRONMENT=sandbox.`;
}

export function squareSetupHints(): string[] {
  const hints: string[] = [];
  const redirectUri = squareOAuthRedirectUri();

  if (!isSquareConfigured()) {
    hints.push("Add SQUARE_APPLICATION_ID and SQUARE_APPLICATION_SECRET in Vercel.");
    return hints;
  }

  if (!squareCredentialsMatchEnvironment()) {
    const mismatch = squareCredentialMismatchMessage();
    if (mismatch) hints.push(mismatch);
  }

  const secretMismatch = squareApplicationSecretMismatchMessage();
  if (secretMismatch) hints.push(secretMismatch);

  hints.push(
    `Register this exact redirect URL in Square → OAuth: ${redirectUri}`
  );

  if (squareEnvironment() === "sandbox") {
    hints.push(
      "Sandbox only: open your Sandbox Seller Dashboard from developer.squareup.com (Apps → Sandbox test account → Open) in another tab, then click Connect Square again."
    );
  }

  return hints;
}

export function squareWebhookUrl(): string {
  return `${getSiteUrl()}/api/webhooks/square`;
}

export const SQUARE_OAUTH_SCOPES = [
  "MERCHANT_PROFILE_READ",
  "PAYMENTS_READ",
  "PAYMENTS_WRITE",
  "ORDERS_WRITE",
].join(" ");
