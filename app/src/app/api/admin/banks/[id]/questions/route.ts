import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

type Format = "multiple_choice" | "number_pad" | "text_pad";

// POST — add a question to the bank. Two modes:
//   { existingId: "abc123" }      — link an existing master-pool question
//   { custom: { ...full Q... } }  — create a new question (source='custom')
//                                   AND link it to the bank in one shot
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const bankId = Number(id);
    if (!bankId) return NextResponse.json({ error: "Bad id" }, { status: 400 });
    const db = getDb();

    const body = (await req.json()) as
      | { existingId: string }
      | {
          custom: {
            subject: string;
            tier: number;
            priLevel?: number;
            prompt: string;
            answer: string;
            format: Format;
            choices?: string[];
            skill?: string;
          };
        };

    let questionId: string;

    if ("existingId" in body) {
      questionId = body.existingId;
      // Make sure it actually exists.
      const [exists] = await db
        .select({ id: schema.questions.id })
        .from(schema.questions)
        .where(eq(schema.questions.id, questionId));
      if (!exists) return NextResponse.json({ error: "Question not found" }, { status: 404 });
    } else {
      const c = body.custom;
      if (!c.prompt || !c.answer || !c.subject || !c.format || !c.tier) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      questionId = `custom-${bankId}-${Date.now().toString(36)}`;
      await db.insert(schema.questions).values({
        id: questionId,
        subject: c.subject,
        tier: c.tier,
        priLevel: c.priLevel ?? 1,
        prompt: c.prompt,
        answer: c.answer,
        format: c.format,
        choices: c.choices ?? null,
        skill: c.skill ?? "custom",
        source: "custom",
      });
    }

    await db
      .insert(schema.bankQuestions)
      .values({ bankId, questionId })
      .onConflictDoNothing();

    return NextResponse.json({ ok: true, questionId });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

// DELETE — unlink a question from the bank (master pool entry stays).
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const bankId = Number(id);
    const url = new URL(req.url);
    const questionId = url.searchParams.get("questionId");
    if (!bankId || !questionId) {
      return NextResponse.json({ error: "Bad id or questionId" }, { status: 400 });
    }
    const db = getDb();
    await db
      .delete(schema.bankQuestions)
      .where(
        and(
          eq(schema.bankQuestions.bankId, bankId),
          eq(schema.bankQuestions.questionId, questionId),
        ),
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
