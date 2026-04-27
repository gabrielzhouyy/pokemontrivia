import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// PUT — assign a player to a bank. Pass `bankId: null` to unassign.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const userId = Number(id);
    if (!userId) return NextResponse.json({ error: "Bad id" }, { status: 400 });

    const body = (await req.json()) as { bankId: number | null };
    const db = getDb();

    if (body.bankId !== null) {
      const [bank] = await db
        .select({ id: schema.banks.id })
        .from(schema.banks)
        .where(eq(schema.banks.id, body.bankId));
      if (!bank) return NextResponse.json({ error: "Bank not found" }, { status: 404 });
    }

    await db
      .update(schema.users)
      .set({ bankId: body.bankId })
      .where(eq(schema.users.id, userId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
