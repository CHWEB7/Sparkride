import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { createAnonServerClient } from "@/lib/supabase/anon-server";
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
  return `Please wait ${resendIn} seconds before requesting another code. Check your inbox for a recent email.`;
}

/**
 * Sends a 6-digit email OTP for daily MFA via the anon auth client so Supabase
 * actually dispatches the email. Must NOT pass emailRedirectTo.
 */
export async function POST(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const resendIn = await getOtpResendIn(user.id);
  if (resendIn > 0) {
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        resendIn,
        message: rateLimitMessage(resendIn),
      },
      { headers: corsHeaders }
    );
  }

  const supabase = createAnonServerClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    const isRateLimited = error.message.toLowerCase().includes("rate limit");
    if (isRateLimited) {
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
    {
      ok: true,
      sent: true,
      resendIn: OTP_RESEND_COOLDOWN_SEC,
      // Supabase returns null user/session when OTP is queued — still a success.
      queued: !data?.user,
    },
    { headers: corsHeaders }
  );
}
