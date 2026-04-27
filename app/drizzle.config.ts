import { config as loadEnv } from "dotenv";
import type { Config } from "drizzle-kit";

// Next.js loads .env.local automatically at runtime, but drizzle-kit (run
// outside Next) does not — load both .env.local and .env explicitly.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
