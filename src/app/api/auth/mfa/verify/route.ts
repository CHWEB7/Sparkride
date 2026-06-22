import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import {
  attachMfaCookie,
  clearPendingOtp,
  recordDailyMfaVerification,
  verifyPendingOtp,
} from "@/lib/mfa-session";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const bodySchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid 6-digit code" }, { status: 400, headers: corsHeaders });
  }

  const valid = await verifyPendingOtp(user.id, parsed.data.code);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid or expired code. Request a new one." },
      { status: 400, headers: corsHeaders }
    );
  }

  await clearPendingOtp(user.id);
  const { cookieValue, maxAge, expiresAt } = await recordDailyMfaVerification(user.id);

  const res = NextResponse.json(
    { ok: true, expiresAt: expiresAt.toISOString() },
    { headers: corsHeaders }
  );
  attachMfaCookie(res, cookieValue, maxAge);
  return res;
}
