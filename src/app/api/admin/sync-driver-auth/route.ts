import { NextRequest, NextResponse } from "next/server";
import {
  syncAllDriverAuthUsers,
  syncDriverAuthUser,
} from "@/lib/sync-driver-auth";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SYNC_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return Boolean(token && token === secret);
}

/**
 * Creates or updates Supabase Auth users for drivers (sets app_metadata.role = driver).
 * Protected by ADMIN_SYNC_SECRET. Runs on Vercel where Supabase credentials exist.
 *
 * Sync all drivers:
 *   curl -X POST https://sparkride-umber.vercel.app/api/admin/sync-driver-auth \
 *     -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
 *
 * Sync one driver:
 *   curl -X POST "https://sparkride-umber.vercel.app/api/admin/sync-driver-auth?email=test@sparkride.co.uk" \
 *     -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
 */
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SYNC_SECRET) {
    return NextResponse.json(
      {
        error:
          "ADMIN_SYNC_SECRET is not configured on this deployment. Add it in Vercel and redeploy.",
      },
      { status: 503 }
    );
  }

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  try {
    if (email) {
      const result = await syncDriverAuthUser(email);
      return NextResponse.json({
        ok: true,
        synced: 1,
        drivers: [result],
        nextStep: `${result.email} should visit /driver/enroll to set up MFA.`,
      });
    }

    const results = await syncAllDriverAuthUsers();
    return NextResponse.json({
      ok: true,
      synced: results.length,
      drivers: results,
      nextStep: "Each driver should visit /driver/enroll to set up their authenticator app.",
    });
  } catch (error) {
    console.error("Driver auth sync failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
