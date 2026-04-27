import { NextResponse } from "next/server";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// GET — master pool with filters. Query params:
//   subject = math|english|chinese|general
//   tier    = 1..4
//   age     = 7|12 (filters age_suggestion)
//   q       = substring search across prompt + answer
//   limit   = max rows to return (default 200)
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const tier = searchParams.get("tier");
    const age = searchParams.get("age");
    const q = searchParams.get("q");
    const limit = Math.min(Number(searchParams.get("limit") ?? 200), 1000);

    const db = getDb();
    const where: SQL[] = [];
    if (subject) where.push(eq(schema.questions.subject, subject));
    if (tier) where.push(eq(schema.questions.tier, Number(tier)));
    if (age) where.push(eq(schema.questions.ageSuggestion, Number(age)));
    if (q && q.length >= 2) {
      const orClause = or(
        ilike(schema.questions.prompt, `%${q}%`),
        ilike(schema.questions.answer, `%${q}%`),
      );
      if (orClause) where.push(orClause);
    }

    const baseQuery = db.select().from(schema.questions);
    const filtered =
      where.length > 0 ? baseQuery.where(and(...where)!) : baseQuery;
    const rows = await filtered.limit(limit);

    return NextResponse.json({ questions: rows });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
