import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth";

// PUT — admin saves the subjects override. Pass `config: null` to clear.
export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = (await req.json()) as { config: unknown | null };
    const db = getDb();
    if (body.config === null) {
      // Clear: keep the row but reset to an empty config so reads return null-ish.
      await db
        .insert(schema.adminSubjects)
        .values({ id: 1, config: { subjects: [], fallback_subject: "math" } })
        .onConflictDoUpdate({
          target: schema.adminSubjects.id,
          set: {
            config: { subjects: [], fallback_subject: "math" },
            updatedAt: new Date(),
          },
        });
      return NextResponse.json({ ok: true, cleared: true });
    }
    await db
      .insert(schema.adminSubjects)
      .values({ id: 1, config: body.config })
      .onConflictDoUpdate({
        target: schema.adminSubjects.id,
        set: { config: body.config, updatedAt: new Date() },
      });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
