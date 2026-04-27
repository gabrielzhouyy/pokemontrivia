import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// Admin-only: wipe a player's progress (kept rows: users.username, users.pinHash,
// users.age. Cleared: starter, owned, caught, evolved, history, stats.)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const userId = Number(id);
    if (!userId) return NextResponse.json({ error: "Bad id" }, { status: 400 });
    const db = getDb();
    const [target] = await db
      .select({ id: schema.users.id, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (target.role !== "player") {
      return NextResponse.json({ error: "Can only reset player profiles" }, { status: 400 });
    }
    await db.update(schema.users).set({ starterId: null }).where(eq(schema.users.id, userId));
    await db.delete(schema.pokemonOwned).where(eq(schema.pokemonOwned.userId, userId));
    await db.delete(schema.caught).where(eq(schema.caught.userId, userId));
    await db.delete(schema.evolved).where(eq(schema.evolved.userId, userId));
    await db.delete(schema.questionHistory).where(eq(schema.questionHistory.userId, userId));
    await db
      .update(schema.userStats)
      .set({ totalAnswered: 0, correct: 0, currentStreak: 0, longestStreak: 0 })
      .where(eq(schema.userStats.userId, userId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
