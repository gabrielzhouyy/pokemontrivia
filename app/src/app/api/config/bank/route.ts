import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireSession } from "@/lib/auth";
import { questionsForBank } from "@/lib/curriculum";

// GET — returns the current user's assigned bank and its questions.
// Questions are read from bundled JSON files (no DB query needed).
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

    return NextResponse.json({
      bankId: bank.id,
      bankName: bank.name,
      questions: questionsForBank(bank.name),
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
