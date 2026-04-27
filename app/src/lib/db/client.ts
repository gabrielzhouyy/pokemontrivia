// Database client (server-side only). Imports the postgres-js driver and
// wires it to Drizzle. Designed for Supabase's transaction pooler URL,
// which is short-lived-connection friendly for Vercel serverless.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url && process.env.NODE_ENV !== "test") {
  // We only throw at first use, not at import time — that way Next.js can
  // build pages that don't touch the DB without crashing.
}

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to app/.env.local — see README for setup.",
    );
  }
  // `prepare: false` is required when connecting through Supabase's transaction
  // pooler (PgBouncer) since PgBouncer doesn't support prepared statements
  // across the connection pool.
  _client = postgres(url, { prepare: false });
  _db = drizzle(_client, { schema });
  return _db;
}

export { schema };
