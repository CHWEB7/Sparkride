import { createHmac, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import {
  SQUARE_OAUTH_SCOPES,
  squareOAuthAuthorizeUrl,
  squareOAuthRedirectUri,
  squareOAuthTokenUrl,
} from "./config";
import { squareRequest } from "./client";

type OAuthStatePayload = {
  driverId: string;
};

function oauthStateSecret(): Uint8Array {
  const secret =
    process.env.SQUARE_OAUTH_STATE_SECRET ||
    process.env.JWT_SECRET ||
    "sparkride-square-oauth-state";
  return new TextEncoder().encode(secret);
}

export async function createOAuthState(driverId: string): Promise<string> {
  return new SignJWT({ driverId } satisfies OAuthStatePayload)
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
    if (typeof driverId !== "string") return null;
    return { driverId };
  } catch {
    return null;
  }
}

export function buildSquareAuthorizeUrl(state: string): string {
  const clientId = process.env.SQUARE_APPLICATION_ID;
  if (!clientId) {
    throw new Error("SQUARE_APPLICATION_ID is not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SQUARE_OAUTH_SCOPES,
    session: "false",
    state,
    redirect_uri: squareOAuthRedirectUri(),
  });

  return `${squareOAuthAuthorizeUrl()}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  merchant_id: string;
};

export async function exchangeSquareOAuthCode(
  code: string
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
  const clientId = process.env.SQUARE_APPLICATION_ID;
  const clientSecret = process.env.SQUARE_APPLICATION_SECRET;
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
      redirect_uri: squareOAuthRedirectUri(),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as TokenResponse & {
    message?: string;
  };

  if (!res.ok || !data.access_token || !data.refresh_token) {
    return { ok: false, error: data.message || "Failed to exchange Square OAuth code" };
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
  const clientId = process.env.SQUARE_APPLICATION_ID;
  const clientSecret = process.env.SQUARE_APPLICATION_SECRET;
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

  const data = (await res.json().catch(() => ({}))) as TokenResponse & {
    message?: string;
  };

  if (!res.ok || !data.access_token || !data.refresh_token) {
    return { ok: false, error: data.message || "Failed to refresh Square access token" };
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
