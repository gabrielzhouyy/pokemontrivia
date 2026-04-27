import { NextResponse } from "next/server";
import { eq, count } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// Admin-only: list all player profiles with summary stats.
export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const players = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        age: schema.users.age,
        starterId: schema.users.starterId,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.role, "player"));

    // Pull stats + counts per user. Single batched query per table is fine
    // for a kid's-game scale (~handful of users).
    const stats = await db.select().from(schema.userStats);
    const statsByUser = new Map(stats.map((s) => [s.userId, s]));

    const caughtCounts = await db
      .select({ userId: schema.caught.userId, c: count() })
      .from(schema.caught)
      .groupBy(schema.caught.userId);
    const caughtByUser = new Map(caughtCounts.map((r) => [r.userId, Number(r.c)]));

    const evolvedCounts = await db
      .select({ userId: schema.evolved.userId, c: count() })
      .from(schema.evolved)
      .groupBy(schema.evolved.userId);
    const evolvedByUser = new Map(evolvedCounts.map((r) => [r.userId, Number(r.c)]));

    const summaries = players.map((p) => {
      const s = statsByUser.get(p.id);
      const total = s?.totalAnswered ?? 0;
      const correct = s?.correct ?? 0;
      return {
        id: p.id,
        username: p.username,
        age: p.age,
        caughtCount: caughtByUser.get(p.id) ?? 0,
        evolvedCount: evolvedByUser.get(p.id) ?? 0,
        totalAnswered: total,
        correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        currentStreak: s?.currentStreak ?? 0,
        longestStreak: s?.longestStreak ?? 0,
        createdAt: p.createdAt.getTime(),
      };
    });

    return NextResponse.json({ users: summaries });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
