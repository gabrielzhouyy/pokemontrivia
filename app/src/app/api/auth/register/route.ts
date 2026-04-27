import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { hashPassword, setSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as { username?: string; pin?: string };
  const username = body.username?.trim().toLowerCase();
  const pin = body.pin;
  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });
  if (!pin || pin.length < 4) return NextResponse.json({ error: "PIN must be at least 4 digits" }, { status: 400 });

  const db = getDb();
  const existing = await db.select().from(schema.users).where(eq(schema.users.username, username));
  if (existing.length > 0) {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }
  // New users default to the "Default" bank if it exists. Drop 5b's seed
  // ensures it does in any environment that's been seeded.
  const [defaultBank] = await db
    .select({ id: schema.banks.id })
    .from(schema.banks)
    .where(eq(schema.banks.name, "Default"));

  const pinHash = await hashPassword(pin);
  const [user] = await db
    .insert(schema.users)
    .values({
      username,
      pinHash,
      role: "player",
      age: 7,
      bankId: defaultBank?.id ?? null,
    })
    .returning();
  await db.insert(schema.userStats).values({ userId: user.id }).onConflictDoNothing();

  await setSession({ userId: user.id, username: user.username, role: user.role as "player" });
  return NextResponse.json({ ok: true, username: user.username });
}
