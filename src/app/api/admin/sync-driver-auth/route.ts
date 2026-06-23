import { NextRequest, NextResponse } from "next/server";
import { syncAllDriverAuthUsers } from "@/lib/sync-driver-auth";

/**
 * One-time / maintenance endpoint to create Supabase Auth users for all drivers.
 * Protected by ADMIN_SYNC_SECRET (set in Vercel env).
 *
 * curl -X POST https://your-site.vercel.app/api/admin/sync-driver-auth \
 *   -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
 */
export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SYNC_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "ADMIN_SYNC_SECRET is not configured on this deployment" },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncAllDriverAuthUsers();
    return NextResponse.json({
      ok: true,
      synced: results.length,
      drivers: results.map(({ email, authUserId, action }) => ({ email, authUserId, action })),
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
