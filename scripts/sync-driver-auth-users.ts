/**
 * Creates or updates Supabase Auth users for all Prisma drivers and links authUserId.
 *
 * Run locally (with production env):
 *   npx vercel env pull .env.production.local --environment=production
 *   dotenv -e .env.production.local -- npx tsx scripts/sync-driver-auth-users.ts
 *
 * Or on production after deploy:
 *   curl -X POST https://sparkride-umber.vercel.app/api/admin/sync-driver-auth \
 *     -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
 */
import { config } from "dotenv";
import { syncAllDriverAuthUsers } from "../src/lib/sync-driver-auth";

config({ path: ".env.production.local" });
config({ path: ".env.local" });
config();

async function main() {
  const results = await syncAllDriverAuthUsers();

  for (const result of results) {
    console.log(`${result.action}:`, result.email, "→", result.authUserId);
  }

  console.log(`\nSynced ${results.length} driver(s). Visit /driver/enroll to register passkeys.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
