import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// PUT — admin saves the entire ad-hoc overlay. The body is the same shape
// the client uses in localStorage:
//   { "age-7": { "1": [Q,...], "2": [...] }, "age-12": {...} }
// We blow away all subject='ad-hoc' rows and re-insert from the payload.
type Overlay = Record<string, Record<string, unknown[]>>;

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = (await req.json()) as { overlay: Overlay };
    if (!body.overlay || typeof body.overlay !== "object") {
      return NextResponse.json({ error: "Missing overlay" }, { status: 400 });
    }
    const db = getDb();
    await db.delete(schema.adminQuestions).where(eq(schema.adminQuestions.subject, "general"));
    const rows: { age: number; subject: string; tier: number; questions: unknown[] }[] = [];
    for (const [ageKey, tiers] of Object.entries(body.overlay)) {
      const age = Number(ageKey.replace(/^age-/, ""));
      if (!Number.isFinite(age)) continue;
      for (const [tierKey, qs] of Object.entries(tiers)) {
        const tier = Number(tierKey);
        if (!Number.isFinite(tier)) continue;
        if (!Array.isArray(qs)) continue;
        rows.push({ age, subject: "general", tier, questions: qs });
      }
    }
    if (rows.length > 0) await db.insert(schema.adminQuestions).values(rows);
    return NextResponse.json({ ok: true, rows: rows.length });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
