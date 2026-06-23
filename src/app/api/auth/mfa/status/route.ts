import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { getMidnightLondonExpiry } from "@/lib/daily-mfa";
import {
  attachMfaCookie,
  hasValidMfaCookie,
  isDailyMfaVerifiedInDb,
  recordDailyMfaVerification,
} from "@/lib/mfa-session";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  if (hasValidMfaCookie(req, user.id)) {
    return NextResponse.json(
      {
        verified: true,
        expiresAt: getMidnightLondonExpiry().toISOString(),
      },
      { headers: corsHeaders }
    );
  }

  // Already verified today on another browser — issue MFA cookie for this browser.
  if (await isDailyMfaVerifiedInDb(user.id)) {
    const { cookieValue, maxAge, expiresAt } = await recordDailyMfaVerification(user.id);
    const res = NextResponse.json(
      {
        verified: true,
        expiresAt: expiresAt.toISOString(),
        restored: true,
      },
      { headers: corsHeaders }
    );
    attachMfaCookie(res, cookieValue, maxAge);
    return res;
  }

  return NextResponse.json(
    {
      verified: false,
      expiresAt: null,
    },
    { headers: corsHeaders }
  );
}
