import { existsSync, readFileSync } from "fs";
import { parse } from "dotenv";

/**
 * Load .env files for local scripts without overwriting existing vars
 * or applying empty placeholder values from vercel env pull.
 */
export function loadProjectEnv() {
  for (const file of [".env.production.local", ".env.local", ".env"]) {
    if (!existsSync(file)) continue;

    const parsed = parse(readFileSync(file));
    for (const [key, value] of Object.entries(parsed)) {
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}
