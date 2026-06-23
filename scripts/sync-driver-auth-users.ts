/**
 * Creates or updates Supabase Auth users for Prisma drivers and links authUserId.
 * Sets app_metadata.role = "driver" automatically — no Supabase dashboard edits needed.
 *
 * Recommended (production API — uses Vercel env):
 *   curl -X POST "https://sparkride-umber.vercel.app/api/admin/sync-driver-auth" \
 *     -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
 *
 * Sync one driver:
 *   curl -X POST "https://sparkride-umber.vercel.app/api/admin/sync-driver-auth?email=test@sparkride.co.uk" \
 *     -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
 *
 * Local (requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env):
 *   npm run sync:driver-auth
 *   npm run sync:driver-auth -- test@sparkride.co.uk
 */
import { loadProjectEnv } from "../src/lib/load-project-env";
import {
  syncAllDriverAuthUsers,
  syncDriverAuthUser,
} from "../src/lib/sync-driver-auth";

loadProjectEnv();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (email) {
    const result = await syncDriverAuthUser(email);
    console.log(`${result.action}:`, result.email, "→", result.authUserId);
    console.log(`\nDone. ${result.email} should visit /driver/enroll to set up MFA.`);
    return;
  }

  const results = await syncAllDriverAuthUsers();

  for (const result of results) {
    console.log(`${result.action}:`, result.email, "→", result.authUserId);
  }

  console.log(`\nSynced ${results.length} driver(s). Visit /driver/enroll to set up MFA.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
