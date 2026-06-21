import { NextResponse } from "next/server";
import { clearDriverCookie } from "@/lib/auth";

export async function POST() {
  await clearDriverCookie();
  return NextResponse.json({ ok: true });
}
