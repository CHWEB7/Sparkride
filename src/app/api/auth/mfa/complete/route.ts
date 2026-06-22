import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { attachMfaCookie, recordDailyMfaVerification } from "@/lib/mfa-session";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const { cookieValue, maxAge, expiresAt } = await recordDailyMfaVerification(user.id);
  const res = NextResponse.json(
    { ok: true, expiresAt: expiresAt.toISOString() },
    { headers: corsHeaders }
  );
  attachMfaCookie(res, cookieValue, maxAge);
  return res;
}
