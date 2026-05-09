import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { setSession } from "@/lib/auth";

const PIKACHU_ID = 25;
const PIKACHU_START_LEVEL = 5;

const BANK_NAME: Record<number, string> = {
  1: "preK\u2013K",
  2: "1st\u20133rd Grade",
  3: "4th\u20135th Grade",
  4: "Adult",
};

export async function POST() {
  const db = getDb();

  // Look up the Easy bank
  const [bank] = await db
    .select({ id: schema.banks.id })
    .from(schema.banks)
    .where(eq(schema.banks.name, BANK_NAME[1]));

  // Upsert the "ash" user
  const [ash] = await db
    .insert(schema.users)
    .values({
      username: "ash",
      pinHash: null,
      color: "yellow",
      role: "player",
      priLevel: 1,
      bankId: bank?.id ?? null,
      starterId: PIKACHU_ID,
    })
    .onConflictDoUpdate({
      target: schema.users.username,
      set: {
        priLevel: 1,
        bankId: bank?.id ?? null,
        starterId: PIKACHU_ID,
        color: "yellow",
      },
    })
    .returning();

  // Reset all game state
  await Promise.all([
    db.delete(schema.pokemonOwned).where(eq(schema.pokemonOwned.userId, ash.id)),
    db.delete(schema.caught).where(eq(schema.caught.userId, ash.id)),
    db.delete(schema.evolved).where(eq(schema.evolved.userId, ash.id)),
    db.delete(schema.questionHistory).where(eq(schema.questionHistory.userId, ash.id)),
  ]);

  // Seed Pikachu
  await Promise.all([
    db.insert(schema.caught).values({ userId: ash.id, speciesId: PIKACHU_ID }),
    db.insert(schema.pokemonOwned).values({
      userId: ash.id,
      speciesId: PIKACHU_ID,
      level: PIKACHU_START_LEVEL,
      evolved: false,
    }),
    db
      .insert(schema.userStats)
      .values({ userId: ash.id, totalAnswered: 0, correct: 0, currentStreak: 0, longestStreak: 0 })
      .onConflictDoUpdate({
        target: schema.userStats.userId,
        set: { totalAnswered: 0, correct: 0, currentStreak: 0, longestStreak: 0 },
      }),
  ]);

  await setSession({ userId: ash.id, username: "ash", role: "player" });
  return NextResponse.json({ ok: true });
}
