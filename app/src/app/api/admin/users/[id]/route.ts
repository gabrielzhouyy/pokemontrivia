import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// Admin-only: delete a player profile permanently. Cascades to all
// per-user tables via the existing onDelete: "cascade" foreign keys
// (pokemon_owned, caught, evolved, question_history, user_stats).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: "Can only delete player profiles" }, { status: 400 });
    }
    await db.delete(schema.users).where(eq(schema.users.id, userId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

// Admin-only: update a player profile's age.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const userId = Number(id);
    if (!userId) return NextResponse.json({ error: "Bad id" }, { status: 400 });
    const body = (await req.json()) as { age?: number };
    const age = body.age;
    if (typeof age !== "number" || age < 3 || age > 99) {
      return NextResponse.json({ error: "Age must be 3-99" }, { status: 400 });
    }
    const db = getDb();
    const [target] = await db
      .select({ id: schema.users.id, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (target.role !== "player") {
      return NextResponse.json({ error: "Can only edit player profiles" }, { status: 400 });
    }
    await db.update(schema.users).set({ age }).where(eq(schema.users.id, userId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
