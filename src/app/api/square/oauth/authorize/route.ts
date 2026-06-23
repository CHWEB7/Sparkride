import { NextResponse } from "next/server";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { prisma } from "@/lib/prisma";
import { isSquareConfigured } from "@/lib/square/config";
import { buildSquareAuthorizeUrl, createOAuthState } from "@/lib/square/oauth";

export async function GET() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSquareConfigured()) {
    return NextResponse.json(
      { error: "Square payments are not configured on this site yet" },
      { status: 503 }
    );
  }

  const state = await createOAuthState(session.driverId);
  const url = buildSquareAuthorizeUrl(state);
  return NextResponse.redirect(url);
}
