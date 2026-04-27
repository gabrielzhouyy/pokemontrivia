import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireSession } from "@/lib/auth";

// GET — returns the current admin-saved subjects override, or null.
// Any logged-in session may read; the player needs this to know which
// subject each Pokemon maps to.
export async function GET() {
  try {
    await requireSession();
    const db = getDb();
    const [row] = await db
      .select()
      .from(schema.adminSubjects)
      .where(eq(schema.adminSubjects.id, 1));
    return NextResponse.json({ override: row?.config ?? null });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
