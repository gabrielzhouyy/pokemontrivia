// Seeds all questions from the bundled JSON files into the Neon DB.
// Safe to re-run — uses upsert so existing rows are updated in place.
// Usage: cd app && node scripts/seed-questions.mjs
import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.local") });
loadEnv({ path: join(__dirname, "..", ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(url);

const SOURCES = [
  { folder: "prek-k",     priLevel: 1 },
  { folder: "grade-1-3",  priLevel: 2 },
  { folder: "grade-4-5",  priLevel: 3 },
  { folder: "adult",      priLevel: 4 },
];

const SUBJECTS = ["math", "singapore_trivia"];

let total = 0;

for (const { folder, priLevel } of SOURCES) {
  for (const subject of SUBJECTS) {
    const filePath = join(__dirname, "..", "data", "questions", "curriculum", folder, `${subject}.json`);
    let questions;
    try {
      questions = JSON.parse(readFileSync(filePath, "utf8"));
    } catch {
      console.log(`  skipping ${folder}/${subject}.json (not found)`);
      continue;
    }
    for (const q of questions) {
      await sql`
        insert into questions (id, subject, tier, pri_level, prompt, answer, format, choices, skill, source, explanation)
        values (
          ${q.id},
          ${subject},
          ${1},
          ${priLevel},
          ${q.prompt},
          ${q.answer},
          ${"multiple_choice"},
          ${JSON.stringify(q.choices ?? [])},
          ${"general"},
          ${"bundled"},
          ${q.explanation ?? null}
        )
        on conflict (id) do update set
          prompt      = excluded.prompt,
          answer      = excluded.answer,
          choices     = excluded.choices,
          explanation = excluded.explanation,
          subject     = excluded.subject,
          pri_level   = excluded.pri_level
      `;
      total++;
    }
    console.log(`  ${folder}/${subject}.json — ${questions.length} questions`);
  }
}

console.log(`\nDone. ${total} questions upserted.`);
process.exit(0);
