import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireSession } from "@/lib/auth";

// GET — returns the current user's assigned bank along with all its
// questions. Used by the player session to populate localStorage cache;
// from there the encounter/training pickers run locally.
export async function GET() {
  try {
    const session = await requireSession();
    const db = getDb();

    const [user] = await db
      .select({ bankId: schema.users.bankId })
      .from(schema.users)
      .where(eq(schema.users.id, session.userId));
    if (!user || user.bankId === null) {
      return NextResponse.json({ bankId: null, questions: [] });
    }

    const [bank] = await db
      .select()
      .from(schema.banks)
      .where(eq(schema.banks.id, user.bankId));
    if (!bank) return NextResponse.json({ bankId: null, questions: [] });

    const links = await db
      .select({ qid: schema.bankQuestions.questionId })
      .from(schema.bankQuestions)
      .where(eq(schema.bankQuestions.bankId, bank.id));
    const ids = links.map((l) => l.qid);
    const questions =
      ids.length > 0
        ? await db.select().from(schema.questions).where(inArray(schema.questions.id, ids))
        : [];

    return NextResponse.json({
      bankId: bank.id,
      bankName: bank.name,
      questions,
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
