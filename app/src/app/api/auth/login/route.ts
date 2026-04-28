import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { setSession, verifyPassword } from "@/lib/auth";

const BANK_NAME: Record<number, string> = {
  1: "preK\u2013K",
  2: "1st\u20133rd Grade",
  3: "4th\u20135th Grade",
  4: "Adult",
};

export async function POST(req: Request) {
  const body = (await req.json()) as { username?: string; pin?: string; priLevel?: number };
  const username = body.username?.trim().toLowerCase();
  const pin = body.pin;
  if (!username || !pin) {
    return NextResponse.json({ error: "Username and PIN required" }, { status: 400 });
  }

  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
  if (!user) return NextResponse.json({ error: "Wrong username or PIN" }, { status: 401 });
  const ok = await verifyPassword(pin, user.pinHash);
  if (!ok) return NextResponse.json({ error: "Wrong username or PIN" }, { status: 401 });

  // If the player picked a different difficulty on the login screen, switch
  // their priLevel + bank assignment. Admin role: always keep as-is.
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
      .where(eq(schema.banks.name, BANK_NAME[body.priLevel]));
    await db
      .update(schema.users)
      .set({
        priLevel: body.priLevel,
        bankId: bank?.id ?? user.bankId,
      })
      .where(eq(schema.users.id, user.id));
  }

  await setSession({ userId: user.id, username: user.username, role: user.role as "player" | "admin" });
  return NextResponse.json({ ok: true, username: user.username, role: user.role });
}
