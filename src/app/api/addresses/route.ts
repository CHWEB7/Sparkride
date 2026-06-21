import { NextRequest, NextResponse } from "next/server";
import { googlePlacesAutocomplete } from "@/lib/google-places";
import { isValidUkPostcode, normalizePostcode } from "@/lib/postcode";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const postcodeParam = (req.nextUrl.searchParams.get("postcode") ?? "").trim();
  const sessionToken = req.nextUrl.searchParams.get("sessionToken") ?? undefined;

  const input = q || (postcodeParam ? normalizePostcode(postcodeParam) : "");

  if (input.length < 3) {
    return NextResponse.json(
      { error: "Enter at least 3 characters to search" },
      { status: 400 }
    );
  }

  if (postcodeParam && !q && !isValidUkPostcode(input)) {
    return NextResponse.json({ error: "Enter a valid UK postcode" }, { status: 400 });
  }

  try {
    const addresses = await googlePlacesAutocomplete(input, sessionToken);
    return NextResponse.json({ query: input, addresses, provider: "google" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Address lookup failed";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
