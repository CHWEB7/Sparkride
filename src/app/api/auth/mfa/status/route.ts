import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { getMidnightLondonExpiry } from "@/lib/daily-mfa";
import { isDailyMfaVerified } from "@/lib/mfa-session";

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

  const verified = await isDailyMfaVerified(user.id, req);
  return NextResponse.json(
    {
      verified,
      expiresAt: verified ? getMidnightLondonExpiry().toISOString() : null,
    },
    { headers: corsHeaders }
  );
}
