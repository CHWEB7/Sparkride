import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getOtpResendIn,
  OTP_RESEND_COOLDOWN_SEC,
  recordOtpSent,
} from "@/lib/mfa-session";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function rateLimitMessage(resendIn: number) {
  return `Please wait ${resendIn} seconds before requesting another code.`;
}

/**
 * Sends a 6-digit email OTP for daily MFA.
 * Must NOT pass emailRedirectTo — that forces a magic link instead of a code.
 */
export async function POST(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const resendIn = await getOtpResendIn(user.id);
  if (resendIn > 0) {
    return NextResponse.json(
      { ok: true, skipped: true, resendIn, message: rateLimitMessage(resendIn) },
      { headers: corsHeaders }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    const isRateLimited = error.message.toLowerCase().includes("rate limit");
    if (isRateLimited) {
      await recordOtpSent(user.id);
      return NextResponse.json(
        {
          error: "Too many verification emails sent. Please wait a minute and try again.",
          resendIn: OTP_RESEND_COOLDOWN_SEC,
        },
        { status: 429, headers: corsHeaders }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
  }

  await recordOtpSent(user.id);

  return NextResponse.json(
    { ok: true, resendIn: OTP_RESEND_COOLDOWN_SEC },
    { headers: corsHeaders }
  );
}
