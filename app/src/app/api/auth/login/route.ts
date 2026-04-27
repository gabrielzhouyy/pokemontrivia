import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as { username?: string; pin?: string };
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

  await setSession({ userId: user.id, username: user.username, role: user.role as "player" | "admin" });
  return NextResponse.json({ ok: true, username: user.username, role: user.role });
}
