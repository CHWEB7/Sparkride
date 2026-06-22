import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clearDailyMfaVerification, clearMfaCookie } from "@/lib/mfa-session";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";

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
  if (user) {
    await clearDailyMfaVerification(user.id);
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const res = NextResponse.json({ ok: true }, { headers: corsHeaders });
  clearMfaCookie(res);
  return res;
}
