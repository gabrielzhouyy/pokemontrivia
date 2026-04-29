import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { setSession } from "@/lib/auth";

const BANK_NAME: Record<number, string> = {
  1: "preK\u2013K",
  2: "1st\u20133rd Grade",
  3: "4th\u20135th Grade",
  4: "Adult",
};

export async function POST(req: Request) {
  const body = (await req.json()) as { username?: string; color?: string; priLevel?: number };
  const username = body.username?.trim().toLowerCase();
  const color = body.color ?? "red";
  const priLevel =
    typeof body.priLevel === "number" && body.priLevel >= 1 && body.priLevel <= 4
      ? body.priLevel
      : 1;
  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));

  if (!user) {
    // Auto-register new player
    const [bank] = await db
      .select({ id: schema.banks.id })
      .from(schema.banks)
      .where(eq(schema.banks.name, BANK_NAME[priLevel]));
    const [newUser] = await db
      .insert(schema.users)
      .values({ username, pinHash: null, color, role: "player", priLevel, bankId: bank?.id ?? null })
      .returning();
    await db.insert(schema.userStats).values({ userId: newUser.id }).onConflictDoNothing();
    await setSession({ userId: newUser.id, username: newUser.username, role: "player" });
    return NextResponse.json({ ok: true, username: newUser.username, role: "player" });
  }

  if (user.color !== color) {
    return NextResponse.json({ error: "Name already taken! Pick a different colour." }, { status: 401 });
  }

  // Existing user — optionally switch priLevel if they picked a different one
  if (
    user.role === "player" &&
    typeof body.priLevel === "number" &&
    body.priLevel >= 1 &&
    body.priLevel <= 4 &&
    body.priLevel !== user.priLevel
  ) {
    const [bank] = await db
      .select({ id: schema.banks.id })
      .from(schema.banks)
      .where(eq(schema.banks.name, BANK_NAME[priLevel]));
    await db
      .update(schema.users)
      .set({ priLevel, bankId: bank?.id ?? user.bankId })
      .where(eq(schema.users.id, user.id));
  }

  await setSession({ userId: user.id, username: user.username, role: user.role as "player" | "admin" });
  return NextResponse.json({ ok: true, username: user.username, role: user.role });
}
