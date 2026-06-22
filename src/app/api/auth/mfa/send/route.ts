import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { generateOtpCode } from "@/lib/mfa-otp";
import {
  getOtpResendIn,
  OTP_RESEND_COOLDOWN_SEC,
  storePendingOtp,
} from "@/lib/mfa-session";
import { sendVerificationCodeEmail } from "@/lib/send-verification-email";

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
        message: `Please wait ${resendIn} seconds before requesting another code.`,
      },
      { headers: corsHeaders }
    );
  }

  const code = generateOtpCode();
  const emailResult = await sendVerificationCodeEmail(user.email, code);

  if (!emailResult.ok) {
    return NextResponse.json({ error: emailResult.error }, { status: 503, headers: corsHeaders });
  }

  await storePendingOtp(user.id, code);

  return NextResponse.json(
    { ok: true, sent: true, resendIn: OTP_RESEND_COOLDOWN_SEC },
    { headers: corsHeaders }
  );
}
