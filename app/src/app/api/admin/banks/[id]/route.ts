import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// GET — bank detail with full question list joined.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const bankId = Number(id);
    if (!bankId) return NextResponse.json({ error: "Bad id" }, { status: 400 });
    const db = getDb();
    const [bank] = await db.select().from(schema.banks).where(eq(schema.banks.id, bankId));
    if (!bank) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const links = await db
      .select({ qid: schema.bankQuestions.questionId })
      .from(schema.bankQuestions)
      .where(eq(schema.bankQuestions.bankId, bankId));
    const ids = links.map((l) => l.qid);
    const questions =
      ids.length > 0
        ? await db.select().from(schema.questions).where(inArray(schema.questions.id, ids))
        : [];

    const userRows = await db
      .select({ id: schema.users.id, username: schema.users.username })
      .from(schema.users)
      .where(eq(schema.users.bankId, bankId));

    return NextResponse.json({
      bank: {
        id: bank.id,
        name: bank.name,
        createdAt: bank.createdAt.getTime(),
        questions,
        users: userRows,
      },
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

// PUT — rename.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const bankId = Number(id);
    const body = (await req.json()) as { name?: string };
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const db = getDb();
    await db
      .update(schema.banks)
      .set({ name, updatedAt: new Date() })
      .where(eq(schema.banks.id, bankId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

// DELETE — delete bank. Reassign affected users to the "Default" bank
// (creating it if missing). bank_questions cascades automatically.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const bankId = Number(id);
    const db = getDb();
    const [bank] = await db.select().from(schema.banks).where(eq(schema.banks.id, bankId));
    if (!bank) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (bank.name === "Default") {
      return NextResponse.json({ error: "Cannot delete the Default bank" }, { status: 400 });
    }
    const [defaultBank] = await db
      .select()
      .from(schema.banks)
      .where(eq(schema.banks.name, "Default"));
    const fallbackId = defaultBank?.id ?? null;
    if (fallbackId) {
      await db
        .update(schema.users)
        .set({ bankId: fallbackId })
        .where(eq(schema.users.bankId, bankId));
    }
    await db.delete(schema.banks).where(eq(schema.banks.id, bankId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
