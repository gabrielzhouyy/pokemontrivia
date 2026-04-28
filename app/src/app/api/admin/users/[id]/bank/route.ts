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

    const body = (await req.json()) as { priLevel?: number };
    const priLevel = body.priLevel;
    if (typeof priLevel !== "number" || priLevel < 1 || priLevel > 4) {
      return NextResponse.json({ error: "priLevel must be 1–4" }, { status: 400 });
    }

    const db = getDb();
    await db.update(schema.users).set({ priLevel }).where(eq(schema.users.id, userId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
