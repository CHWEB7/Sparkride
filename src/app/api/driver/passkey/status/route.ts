import { NextResponse } from "next/server";
import {
  driverHasPasskey,
  getDriverSession,
} from "@/lib/driver-auth";

export async function GET() {
  const session = await getDriverSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, hasPasskey: false }, { status: 401 });
  }

  const hasPasskey = await driverHasPasskey(session.authUserId);

  return NextResponse.json({
    authenticated: true,
    hasPasskey,
    name: session.name,
    email: session.email,
  });
}
