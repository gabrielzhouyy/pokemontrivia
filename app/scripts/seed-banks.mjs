// Creates the 4 grade banks in Neon if they don't exist.
// Questions are no longer stored in the DB — they're bundled as JSON and
// served directly by the app. Re-run this only if you wipe the banks table.
// Usage: cd app && node scripts/seed-banks.mjs
import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.local") });
loadEnv({ path: join(__dirname, "..", ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run from app/ with .env.local present.");
  process.exit(1);
}
const sql = neon(url);

const BANKS = ["preK\u2013K", "1st\u20133rd Grade", "4th\u20135th Grade", "Adult"];

for (const name of BANKS) {
  await sql`
    insert into banks (name) values (${name})
    on conflict (name) do nothing
  `;
  console.log(`  ${name}`);
}

console.log("Done.");
process.exit(0);
