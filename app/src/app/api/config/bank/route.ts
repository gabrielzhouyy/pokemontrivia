import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { requireSession } from "@/lib/auth";
import { questionsForBank } from "@/lib/curriculum";

const BANK_NAME: Record<number, string> = {
  1: "preK\u2013K",
  2: "1st\u20133rd Grade",
  3: "4th\u20135th Grade",
  4: "Adult",
};

// GET — returns the current user's difficulty tier and its questions from
// bundled JSON. No DB lookup for banks needed — priLevel drives everything.
export async function GET() {
  try {
    const session = await requireSession();
    const db = getDb();

    const [user] = await db
      .select({ priLevel: schema.users.priLevel })
      .from(schema.users)
      .where(eq(schema.users.id, session.userId));
    if (!user) return NextResponse.json({ bankId: null, questions: [] });

    const bankName = BANK_NAME[user.priLevel] ?? BANK_NAME[1];
    return NextResponse.json({
      bankId: null,
      bankName,
      questions: questionsForBank(bankName),
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
