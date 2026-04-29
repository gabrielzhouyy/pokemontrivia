import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// PUT — set a player's difficulty level (priLevel 1–4).
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const userId = Number(id);
    if (!userId) return NextResponse.json({ error: "Bad id" }, { status: 400 });

    const body = (await req.json()) as { priLevel?: number; subjectFilter?: string | null };

    const updates: Record<string, unknown> = {};

    if (body.priLevel !== undefined) {
      const priLevel = body.priLevel;
      if (typeof priLevel !== "number" || priLevel < 1 || priLevel > 4) {
        return NextResponse.json({ error: "priLevel must be 1–4" }, { status: 400 });
      }
      updates.priLevel = priLevel;
    }

    if ("subjectFilter" in body) {
      const sf = body.subjectFilter;
      const valid = [null, "math", "singapore_trivia"];
      if (!valid.includes(sf ?? null)) {
        return NextResponse.json({ error: "subjectFilter must be null, 'math', or 'singapore_trivia'" }, { status: 400 });
      }
      updates.subjectFilter = sf ?? null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const db = getDb();
    await db.update(schema.users).set(updates).where(eq(schema.users.id, userId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
