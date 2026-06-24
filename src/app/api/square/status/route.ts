import { NextResponse } from "next/server";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { getDriverSquareStatus } from "@/lib/square/driver-status";

export async function GET() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getDriverSquareStatus(session.driverId);
  if (!status) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }

  return NextResponse.json(status);
}
