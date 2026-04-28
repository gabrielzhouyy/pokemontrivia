import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = (await req.json()) as {
      subject?: string;
      priLevel?: number;
      prompt?: string;
      answer?: string;
      choices?: string[];
      explanation?: string;
    };

    const db = getDb();
    const [row] = await db
      .update(schema.questions)
      .set({
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.priLevel !== undefined && { priLevel: body.priLevel }),
        ...(body.prompt !== undefined && { prompt: body.prompt.trim() }),
        ...(body.answer !== undefined && { answer: body.answer.trim() }),
        ...(body.choices !== undefined && { choices: body.choices }),
        ...({ explanation: body.explanation?.trim() || null }),
      })
      .where(eq(schema.questions.id, id))
      .returning();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ question: row });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDb();
    await db.delete(schema.questions).where(eq(schema.questions.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
