import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  exchangeSquareOAuthCode,
  fetchDefaultSquareLocationId,
  verifyOAuthState,
} from "@/lib/square/oauth";
import { saveDriverSquareTokens } from "@/lib/square/driver-tokens";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const dashboardUrl = `${getSiteUrl()}/driver/dashboard`;

  if (error) {
    return NextResponse.redirect(`${dashboardUrl}?square=error`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${dashboardUrl}?square=error`);
  }

  const statePayload = await verifyOAuthState(state);
  if (!statePayload) {
    return NextResponse.redirect(`${dashboardUrl}?square=error`);
  }

  const tokenResult = await exchangeSquareOAuthCode(code);
  if (!tokenResult.ok) {
    console.error("Square OAuth exchange failed:", tokenResult.error);
    return NextResponse.redirect(`${dashboardUrl}?square=error`);
  }

  const locationId = await fetchDefaultSquareLocationId(tokenResult.accessToken);
  if (!locationId) {
    console.error("Square OAuth: no active location found for merchant");
    return NextResponse.redirect(`${dashboardUrl}?square=no_location`);
  }

  await saveDriverSquareTokens(statePayload.driverId, {
    merchantId: tokenResult.merchantId,
    locationId,
    accessToken: tokenResult.accessToken,
    refreshToken: tokenResult.refreshToken,
    expiresAt: tokenResult.expiresAt,
  });

  return NextResponse.redirect(`${dashboardUrl}?square=connected`);
}
