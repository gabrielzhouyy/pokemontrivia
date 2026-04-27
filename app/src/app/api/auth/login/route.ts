import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { setSession, verifyPassword } from "@/lib/auth";

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

  // Pri-on-relogin: if the user picked a different Pri level on the login
  // screen than what's currently stored, switch their pri_level + bank
  // assignment. Only applies to player profiles (admin role: keep priLevel
  // as-is, regardless of what came in the body).
  if (
    user.role === "player" &&
    typeof body.priLevel === "number" &&
    body.priLevel >= 1 &&
    body.priLevel <= 6 &&
    body.priLevel !== user.priLevel
  ) {
    const [priBank] = await db
      .select({ id: schema.banks.id })
      .from(schema.banks)
      .where(eq(schema.banks.name, `Pri ${body.priLevel}`));
    await db
      .update(schema.users)
      .set({
        priLevel: body.priLevel,
        bankId: priBank?.id ?? user.bankId,
      })
      .where(eq(schema.users.id, user.id));
  }

  await setSession({ userId: user.id, username: user.username, role: user.role as "player" | "admin" });
  return NextResponse.json({ ok: true, username: user.username, role: user.role });
}
