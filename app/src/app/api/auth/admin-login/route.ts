import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { hashPassword, setSession, verifyPassword } from "@/lib/auth";

// Admin login. If no admin exists yet, the first request creates one
// (first-run setup) — anybody hitting this endpoint with `enroll: true`
// becomes the admin. After that, only the existing admin can log in.

export async function POST(req: Request) {
  const body = (await req.json()) as { password?: string; enroll?: boolean };
  const password = body.password;
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const db = getDb();
  const [admin] = await db.select().from(schema.users).where(eq(schema.users.role, "admin"));

  if (!admin) {
    if (!body.enroll) {
      return NextResponse.json({ enroll: true }, { status: 200 });
    }
    const pinHash = await hashPassword(password);
    const [created] = await db
      .insert(schema.users)
      .values({ username: "oak", pinHash, role: "admin", priLevel: 1 })
      .returning();
    await setSession({ userId: created.id, username: created.username, role: "admin" });
    return NextResponse.json({ ok: true, role: "admin" });
  }

  const ok = await verifyPassword(password, admin.pinHash);
  if (!ok) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  await setSession({ userId: admin.id, username: admin.username, role: "admin" });
  return NextResponse.json({ ok: true, role: "admin" });
}
