import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireSession } from "@/lib/auth";
import type { Profile } from "@/lib/profile-types";

// Assemble the kid's full Profile from the relational tables. Mirrors the
// shape used by the frontend (src/lib/storage.ts Profile type). Fires all
// 6 queries concurrently — they're independent.
async function assembleProfile(userId: number): Promise<Profile | null> {
  const db = getDb();

  const [userRows, statsRows, ownedRows, caughtRows, evolvedRows, historyRows] =
    await Promise.all([
      db.select().from(schema.users).where(eq(schema.users.id, userId)),
      db.select().from(schema.userStats).where(eq(schema.userStats.userId, userId)),
      db.select().from(schema.pokemonOwned).where(eq(schema.pokemonOwned.userId, userId)),
      db
        .select({ speciesId: schema.caught.speciesId })
        .from(schema.caught)
        .where(eq(schema.caught.userId, userId)),
      db
        .select({ speciesId: schema.evolved.speciesId })
        .from(schema.evolved)
        .where(eq(schema.evolved.userId, userId)),
      db.select().from(schema.questionHistory).where(eq(schema.questionHistory.userId, userId)),
    ]);

  const user = userRows[0];
  if (!user) return null;
  const stats = statsRows[0];

  const owned: Profile["owned"] = {};
  for (const row of ownedRows) {
    owned[row.speciesId] = { level: row.level, evolved: row.evolved };
  }

  const caught = caughtRows.map((r) => r.speciesId);
  const evolved = evolvedRows.map((r) => r.speciesId);

  const history: Profile["history"] = {};
  for (const row of historyRows) {
    history[row.questionId] = {
      id: row.questionId,
      correct: row.correct,
      ts: row.ts.getTime(),
      reviewCounter: row.reviewCounter,
    };
  }

  return {
    username: user.username,
    pin: "", // server never returns the hash
    starterId: user.starterId,
    priLevel: user.priLevel,
    caught,
    owned,
    evolved,
    history,
    stats: {
      totalAnswered: stats?.totalAnswered ?? 0,
      correct: stats?.correct ?? 0,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
    },
    createdAt: user.createdAt.getTime(),
  };
}

// Apply the full Profile object to the DB by replacing the user's rows.
// Naive but correct: delete-then-insert per table. Profile is ~5KB so this
// is fast enough for a kid's game.
async function persistProfile(userId: number, profile: Profile): Promise<void> {
  const db = getDb();

  await db
    .update(schema.users)
    .set({
      starterId: profile.starterId,
      priLevel: profile.priLevel,
    })
    .where(eq(schema.users.id, userId));

  await db.delete(schema.pokemonOwned).where(eq(schema.pokemonOwned.userId, userId));
  const ownedValues = Object.entries(profile.owned).map(([speciesId, p]) => ({
    userId,
    speciesId: Number(speciesId),
    level: p.level,
    evolved: p.evolved,
  }));
  if (ownedValues.length > 0) await db.insert(schema.pokemonOwned).values(ownedValues);

  await db.delete(schema.caught).where(eq(schema.caught.userId, userId));
  if (profile.caught.length > 0) {
    await db
      .insert(schema.caught)
      .values(profile.caught.map((speciesId) => ({ userId, speciesId })));
  }

  await db.delete(schema.evolved).where(eq(schema.evolved.userId, userId));
  if (profile.evolved.length > 0) {
    await db
      .insert(schema.evolved)
      .values(profile.evolved.map((speciesId) => ({ userId, speciesId })));
  }

  await db
    .delete(schema.questionHistory)
    .where(eq(schema.questionHistory.userId, userId));
  const historyValues = Object.values(profile.history).map((h) => ({
    userId,
    questionId: h.id,
    correct: h.correct,
    reviewCounter: h.reviewCounter ?? 0,
    ts: new Date(h.ts),
  }));
  if (historyValues.length > 0) {
    await db.insert(schema.questionHistory).values(historyValues);
  }

  await db
    .insert(schema.userStats)
    .values({
      userId,
      totalAnswered: profile.stats.totalAnswered,
      correct: profile.stats.correct,
      currentStreak: profile.stats.currentStreak,
      longestStreak: profile.stats.longestStreak,
    })
    .onConflictDoUpdate({
      target: schema.userStats.userId,
      set: {
        totalAnswered: profile.stats.totalAnswered,
        correct: profile.stats.correct,
        currentStreak: profile.stats.currentStreak,
        longestStreak: profile.stats.longestStreak,
      },
    });
}

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await assembleProfile(session.userId);
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireSession();
    const body = (await req.json()) as { profile: Profile };
    if (!body.profile) {
      return NextResponse.json({ error: "Missing profile" }, { status: 400 });
    }
    // Force the username on the server side — clients can't rename via PUT.
    const safe: Profile = { ...body.profile, username: session.username };
    await persistProfile(session.userId, safe);
    const fresh = await assembleProfile(session.userId);
    return NextResponse.json({ profile: fresh });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
