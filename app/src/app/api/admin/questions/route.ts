import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const priLevel = searchParams.get("priLevel");
    const subject = searchParams.get("subject");

    const db = getDb();
    const conditions = [];
    if (priLevel) conditions.push(eq(schema.questions.priLevel, Number(priLevel)));
    if (subject) conditions.push(eq(schema.questions.subject, subject));

    const rows = await db
      .select()
      .from(schema.questions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.questions.priLevel, schema.questions.subject, schema.questions.createdAt);

    return NextResponse.json({ questions: rows });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = (await req.json()) as {
      subject: string;
      priLevel: number;
      prompt: string;
      answer: string;
      choices: string[];
      explanation?: string;
    };

    if (!body.prompt?.trim() || !body.answer?.trim()) {
      return NextResponse.json({ error: "Prompt and answer are required" }, { status: 400 });
    }

    const id = `${body.subject.slice(0, 2)}-${Date.now()}`;
    const db = getDb();
    const [row] = await db
      .insert(schema.questions)
      .values({
        id,
        subject: body.subject,
        priLevel: body.priLevel,
        tier: 1,
        prompt: body.prompt.trim(),
        answer: body.answer.trim(),
        format: "multiple_choice",
        choices: body.choices,
        skill: "custom",
        source: "custom",
        explanation: body.explanation?.trim() || null,
      })
      .returning();

    return NextResponse.json({ question: row });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
