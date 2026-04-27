// Database client (server-side only). Uses Neon's HTTP driver so each query
// rides over a single HTTPS request instead of holding a TCP+TLS connection.
// This eliminates the cold-start handshake on Vercel serverless. Drizzle's
// neon-http adapter speaks the same SQL builder as before.

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to app/.env.local — see README for setup.",
    );
  }
  _db = drizzle(neon(url), { schema });
  return _db;
}

export { schema };
