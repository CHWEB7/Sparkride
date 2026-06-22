import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * Sends a 6-digit email OTP for daily MFA.
 * Must NOT pass emailRedirectTo — that forces a magic link instead of a code.
 * Supabase Magic Link email template must use {{ .Token }}, not {{ .ConfirmationURL }}.
 */
export async function POST(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}
