import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
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
  ],
};
