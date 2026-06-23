import { createHmac, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import {
  SQUARE_OAUTH_SCOPES,
  squareApplicationId,
  squareApplicationSecret,
  squareEnvironment,
  squareOAuthAuthorizeUrl,
  squareOAuthRedirectUri,
  squareOAuthTokenUrl,
} from "./config";
import { squareRequest } from "./client";

type OAuthStatePayload = {
  driverId: string;
  redirectUri: string;
};

function oauthStateSecret(): Uint8Array {
  const secret =
    process.env.SQUARE_OAUTH_STATE_SECRET ||
    process.env.JWT_SECRET ||
    "sparkride-square-oauth-state";
  return new TextEncoder().encode(secret);
}

export async function createOAuthState(
  driverId: string,
  redirectUri: string
): Promise<string> {
  return new SignJWT({ driverId, redirectUri } satisfies OAuthStatePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(oauthStateSecret());
}

export async function verifyOAuthState(
  state: string
): Promise<OAuthStatePayload | null> {
  try {
    const { payload } = await jwtVerify(state, oauthStateSecret());
    const driverId = payload.driverId;
    const redirectUri = payload.redirectUri;
    if (typeof driverId !== "string" || typeof redirectUri !== "string") return null;
    return { driverId, redirectUri };
  } catch {
    return null;
  }
}

export function buildSquareAuthorizeUrl(state: string, redirectUri: string): string {
  const clientId = squareApplicationId();
  if (!clientId) {
    throw new Error("SQUARE_APPLICATION_ID is not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SQUARE_OAUTH_SCOPES,
    state,
    redirect_uri: redirectUri,
  });

  // session=false forces login in production; ignored (and omitted) in sandbox.
  if (squareEnvironment() === "production") {
    params.set("session", "false");
  }

  return `${squareOAuthAuthorizeUrl()}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  merchant_id: string;
};

type SquareApiErrors = {
  message?: string;
  errors?: Array<{ detail?: string; code?: string; category?: string }>;
};

function formatSquareApiError(data: SquareApiErrors, fallback: string): string {
  const fromErrors = data.errors
    ?.map((e) => e.detail || e.code)
    .filter(Boolean)
    .join("; ");
  return fromErrors || data.message || fallback;
}

export async function exchangeSquareOAuthCode(
  code: string,
  redirectUri: string
): Promise<
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
      merchantId: string;
    }
  | { ok: false; error: string }
> {
  const clientId = squareApplicationId();
  const clientSecret = squareApplicationSecret();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "Square application credentials are not configured" };
  }

  const res = await fetch(squareOAuthTokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as TokenResponse & SquareApiErrors;

  if (!res.ok || !data.access_token || !data.refresh_token) {
    return {
      ok: false,
      error: formatSquareApiError(data, "Failed to exchange Square OAuth code"),
    };
  }

  return {
    ok: true,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(data.expires_at),
    merchantId: data.merchant_id,
  };
}

export async function refreshSquareAccessToken(
  refreshToken: string
): Promise<
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    }
  | { ok: false; error: string }
> {
  const clientId = squareApplicationId();
  const clientSecret = squareApplicationSecret();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "Square application credentials are not configured" };
  }

  const res = await fetch(squareOAuthTokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as TokenResponse & SquareApiErrors;

  if (!res.ok || !data.access_token || !data.refresh_token) {
    return {
      ok: false,
      error: formatSquareApiError(data, "Failed to refresh Square access token"),
    };
  }

  return {
    ok: true,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(data.expires_at),
  };
}

type LocationsResponse = {
  locations?: Array<{ id: string; status?: string }>;
};

export async function fetchDefaultSquareLocationId(
  accessToken: string
): Promise<string | null> {
  const result = await squareRequest<LocationsResponse>({
    accessToken,
    path: "/v2/locations",
  });

  if (!result.ok) return null;

  const active = result.data.locations?.find((loc) => loc.status === "ACTIVE");
  return active?.id ?? result.data.locations?.[0]?.id ?? null;
}

export function verifySquareWebhookSignature(
  signatureHeader: string | null,
  notificationUrl: string,
  body: string
): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey || !signatureHeader) return false;

  const digest = createHmac("sha256", signatureKey)
    .update(notificationUrl + body)
    .digest("base64");

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
