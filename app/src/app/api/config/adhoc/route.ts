import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireSession } from "@/lib/auth";

// GET — returns the full ad-hoc overlay, shape:
//   { "age-7": { "1": [Q,...], "2": [...] }, "age-12": ... }
// Assembled from admin_questions rows with subject='ad-hoc'.
export async function GET() {
  try {
    await requireSession();
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.adminQuestions)
      .where(eq(schema.adminQuestions.subject, "general"));
    const overlay: Record<string, Record<string, unknown[]>> = {};
    for (const row of rows) {
      const ageKey = `age-${row.age}`;
      if (!overlay[ageKey]) overlay[ageKey] = {};
      overlay[ageKey][String(row.tier)] = row.questions as unknown[];
    }
    return NextResponse.json({ overlay });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
