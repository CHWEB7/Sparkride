import { NextRequest, NextResponse } from "next/server";
import { googlePlaceDetails } from "@/lib/google-places";

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId") ?? "";
  const sessionToken = req.nextUrl.searchParams.get("sessionToken") ?? undefined;

  if (!placeId) {
    return NextResponse.json({ error: "Place ID is required" }, { status: 400 });
  }

  try {
    const details = await googlePlaceDetails(placeId, sessionToken);
    return NextResponse.json(details);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load address";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
