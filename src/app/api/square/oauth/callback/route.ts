import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  exchangeSquareOAuthCode,
  fetchDefaultSquareLocationId,
  verifyOAuthState,
} from "@/lib/square/oauth";
import { saveDriverSquareTokens } from "@/lib/square/driver-tokens";
import { backfillDriverPaymentLinks } from "@/lib/booking-confirmation";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const dashboardUrl = `${getSiteUrl()}/driver/dashboard`;

  function redirectWithSquareError(reason: string, detail?: string) {
    const params = new URLSearchParams({ square: "error", reason });
    if (detail) {
      params.set("detail", detail.slice(0, 300));
    }
    return NextResponse.redirect(`${dashboardUrl}?${params.toString()}`);
  }

  try {
    if (error) {
      const description = searchParams.get("error_description");
      console.error("Square OAuth denied:", error, description ?? "");
      return redirectWithSquareError(error, description ?? undefined);
    }

    if (!code || !state) {
      return redirectWithSquareError(
        "missing_code_or_state",
        "Square did not return an authorization code. Try Connect Square again without refreshing."
      );
    }

    const statePayload = await verifyOAuthState(state);
    if (!statePayload) {
      return redirectWithSquareError(
        "invalid_state",
        "The OAuth session expired or was invalid. Click Connect Square again. Ensure SQUARE_OAUTH_STATE_SECRET is set in Vercel and redeployed."
      );
    }

    const tokenResult = await exchangeSquareOAuthCode(code, statePayload.redirectUri);
    if (!tokenResult.ok) {
      console.error("Square OAuth exchange failed:", tokenResult.error);
      return redirectWithSquareError("token_exchange_failed", tokenResult.error);
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

    await backfillDriverPaymentLinks(statePayload.driverId).catch((err) => {
      console.error("Square payment link backfill failed:", err);
    });

    return NextResponse.redirect(`${dashboardUrl}?square=connected`);
  } catch (err) {
    console.error("Square OAuth callback failed:", err);
    const message =
      err instanceof Error ? err.message : "Unexpected error saving Square connection";
    const isSchemaError =
      message.includes("squareMerchantId") ||
      message.includes("squareLocationId") ||
      message.includes("Unknown field") ||
      message.includes("column") ||
      message.includes("does not exist");

    return redirectWithSquareError(
      "save_failed",
      isSchemaError
        ? "Database is missing Square columns. Run prisma/sql/add-payment-columns.sql in Supabase SQL Editor, then try again."
        : message
    );
  }
}
