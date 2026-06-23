import { NextResponse } from "next/server";
import { getDriverSession } from "@/lib/driver-auth";
import {
  driverHasVerifiedTotp,
  driverSessionIsMfaComplete,
} from "@/lib/driver-mfa";

export async function GET() {
  const session = await getDriverSession();
  if (!session) {
    return NextResponse.json(
      { authenticated: false, hasMfa: false, mfaComplete: false },
      { status: 401 }
    );
  }

  const hasMfa = await driverHasVerifiedTotp(session.authUserId);
  const mfaComplete = await driverSessionIsMfaComplete();

  return NextResponse.json({
    authenticated: true,
    hasMfa,
    mfaComplete,
    name: session.name,
    email: session.email,
  });
}
