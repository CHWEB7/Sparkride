import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { updateDriverSession } from "@/lib/supabase/driver-middleware";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/driver")) {
    return updateDriverSession(request);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/book/:path*",
    "/my-bookings/:path*",
    "/account/:path*",
    "/booking/:path*",
    "/login",
    "/signup",
    "/verify-2fa",
    "/driver/:path*",
  ],
};
