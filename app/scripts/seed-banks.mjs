// Seeds the new curriculum banks (4 grade tiers × 2 subjects).
// Idempotent: re-run any time to reset banks to bundled content.
// Re-run with: cd app && node scripts/seed-banks.mjs
import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.local") });
loadEnv({ path: join(__dirname, "..", ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run from app/ with .env.local present.");
  process.exit(1);
}
const sql = neon(url);

// Remove any questions not from the new curriculum.
await sql`delete from bank_questions`;
await sql`delete from banks`;
await sql`delete from questions where source = 'bundled' and skill = 'general' is false`;
await sql`delete from questions`;
console.log("Cleared old questions and banks.");

const NEW_GRADES = [
  { dir: "prek-k",    bankName: "preK\u2013K" },
  { dir: "grade-1-3", bankName: "1st\u20133rd Grade" },
  { dir: "grade-4-5", bankName: "4th\u20135th Grade" },
  { dir: "adult",     bankName: "Adult" },
];
const NEW_SUBJECTS = ["math", "singapore_trivia"];
const NCDIR = join(__dirname, "..", "data", "questions", "curriculum");

console.log("Seeding new curriculum banks\u2026");
for (const grade of NEW_GRADES) {
  const gradeQuestions = [];
  for (const subject of NEW_SUBJECTS) {
    const path = join(NCDIR, grade.dir, `${subject}.json`);
    let items;
    try {
      items = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      continue;
    }
    for (const q of items) {
      gradeQuestions.push({
        id: q.id,
        subject,
        tier: 1,
        priLevel: 0,
        prompt: q.prompt,
        answer: q.answer,
        format: "multiple_choice",
        choices: q.choices ?? null,
        skill: "general",
      });
    }
  }

  // Upsert questions.
  for (const q of gradeQuestions) {
    await sql`
      insert into questions (id, subject, tier, pri_level, prompt, answer, format, choices, skill, source)
      values (${q.id}, ${q.subject}, ${q.tier}, ${q.priLevel}, ${q.prompt}, ${q.answer}, ${q.format},
              ${q.choices ? JSON.stringify(q.choices) : null}::jsonb, ${q.skill}, 'bundled')
      on conflict (id) do update set
        subject = excluded.subject,
        tier = excluded.tier,
        prompt = excluded.prompt,
        answer = excluded.answer,
        format = excluded.format,
        choices = excluded.choices,
        skill = excluded.skill,
        source = excluded.source
    `;
  }

  // Create/update bank.
  const [bank] = await sql`
    insert into banks (name) values (${grade.bankName})
    on conflict (name) do update set updated_at = now()
    returning id
  `;

  // Repopulate bank links.
  await sql`delete from bank_questions where bank_id = ${bank.id}`;
  for (const q of gradeQuestions) {
    await sql`
      insert into bank_questions (bank_id, question_id) values (${bank.id}, ${q.id})
      on conflict do nothing
    `;
  }
  console.log(`  ${grade.bankName}: ${gradeQuestions.length} questions`);
}

console.log("Seed complete.");
process.exit(0);
