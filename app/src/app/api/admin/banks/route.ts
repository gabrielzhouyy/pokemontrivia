import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// GET — list all banks with question count and assigned-user count.
export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const banks = await db.select().from(schema.banks).orderBy(schema.banks.id);

    const qCounts = await db
      .select({ bankId: schema.bankQuestions.bankId, c: count() })
      .from(schema.bankQuestions)
      .groupBy(schema.bankQuestions.bankId);
    const qMap = new Map(qCounts.map((r) => [r.bankId, Number(r.c)]));

    const uCounts = await db
      .select({ bankId: schema.users.bankId, c: count() })
      .from(schema.users)
      .where(eq(schema.users.role, "player"))
      .groupBy(schema.users.bankId);
    const uMap = new Map(uCounts.map((r) => [r.bankId, Number(r.c)]));

    return NextResponse.json({
      banks: banks.map((b) => ({
        id: b.id,
        name: b.name,
        questionCount: qMap.get(b.id) ?? 0,
        userCount: uMap.get(b.id) ?? 0,
        createdAt: b.createdAt.getTime(),
      })),
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

// POST — create a new bank with a name.
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = (await req.json()) as { name?: string };
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const db = getDb();
    const [created] = await db
      .insert(schema.banks)
      .values({ name })
      .onConflictDoNothing()
      .returning();
    if (!created) {
      return NextResponse.json({ error: "Name already taken" }, { status: 409 });
    }
    return NextResponse.json({ bank: created });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

