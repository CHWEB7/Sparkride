import { NextResponse } from "next/server";
import { signOutDriver } from "@/lib/driver-auth";

export async function POST() {
  await signOutDriver();
  return NextResponse.json({ ok: true });
}
