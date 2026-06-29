import { NextResponse } from "next/server";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { clearDriverSquareTokens } from "@/lib/square/driver-tokens";
import { getSiteUrl } from "@/lib/site-url";

export async function POST() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearDriverSquareTokens(session.driverId);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearDriverSquareTokens(session.driverId);
  return NextResponse.redirect(`${getSiteUrl()}/driver/settings/integrations?square=disconnected`);
}
