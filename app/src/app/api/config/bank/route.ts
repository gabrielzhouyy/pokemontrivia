import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireSession } from "@/lib/auth";

const BANK_NAME: Record<number, string> = {
  1: "preK\u2013K",
  2: "1st\u20133rd Grade",
  3: "4th\u20135th Grade",
  4: "Adult",
};

// GET — returns the current user's questions from the DB, filtered by priLevel.
export async function GET() {
  try {
    const session = await requireSession();
    const db = getDb();

    const [user] = await db
      .select({ priLevel: schema.users.priLevel })
      .from(schema.users)
      .where(eq(schema.users.id, session.userId));
    if (!user) return NextResponse.json({ bankId: null, questions: [] });

    const qs = await db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.priLevel, user.priLevel));

    return NextResponse.json({
      bankId: null,
      bankName: BANK_NAME[user.priLevel] ?? BANK_NAME[1],
      questions: qs.map((q) => ({
        id: q.id,
        subject: q.subject,
        tier: q.tier,
        skill: q.skill,
        prompt: q.prompt,
        answer: q.answer,
        format: q.format,
        choices: q.choices ?? undefined,
        explanation: q.explanation ?? undefined,
      })),
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
