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

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = (await req.json()) as { priLevel?: number };
    const priLevel = body.priLevel;
    if (typeof priLevel !== "number" || priLevel < 1 || priLevel > 4) {
      return NextResponse.json({ error: "Invalid priLevel" }, { status: 400 });
    }

    const db = getDb();
    const [bank] = await db
      .select({ id: schema.banks.id })
      .from(schema.banks)
      .where(eq(schema.banks.name, BANK_NAME[priLevel]));

    await db
      .update(schema.users)
      .set({ priLevel, bankId: bank?.id ?? null })
      .where(eq(schema.users.id, session.userId));

    return NextResponse.json({ priLevel, bankId: bank?.id ?? null });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
