import { getSiteUrl } from "@/lib/site-url";

export const SQUARE_API_VERSION = "2024-11-20";

export function isSquareConfigured(): boolean {
  return Boolean(
    process.env.SQUARE_APPLICATION_ID && process.env.SQUARE_APPLICATION_SECRET
  );
}

export function squareEnvironment(): "sandbox" | "production" {
  return process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";
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

export function squareOAuthRedirectUri(): string {
  return `${getSiteUrl()}/api/square/oauth/callback`;
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
