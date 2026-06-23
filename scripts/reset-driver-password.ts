/**
 * @deprecated Use `npm run sync:driver-auth -- email@example.com` instead.
 */
import { loadProjectEnv } from "../src/lib/load-project-env";
import { syncDriverAuthUser } from "../src/lib/sync-driver-auth";

loadProjectEnv();

const email = (process.argv[2] || "test@sparkride.co.uk").toLowerCase();

syncDriverAuthUser(email)
  .then((result) => {
    console.log(`${result.action}:`, result.email, "→", result.authUserId);
    console.log(`\nDone. Visit /driver/enroll to set up MFA.`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
