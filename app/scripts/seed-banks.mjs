// Seeds the questions / banks / bank_questions tables from the bundled
// JSON files in app/data/questions/age-{7,12}/<subject>/tier-N.json.
//
// Idempotent: re-runs upsert each question by id, recreates the "Default"
// bank's links, and assigns any user without a bank → Default.
//
// Re-run with: cd app && node scripts/seed-banks.mjs
import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
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

const QDIR = join(__dirname, "..", "data", "questions");

const SUBJECTS = ["math", "english", "chinese", "general"];

// Read every JSON file and collect questions tagged with their (subject, age).
const all = [];
for (const ageDir of readdirSync(QDIR).filter((d) => d.startsWith("age-"))) {
  const age = Number(ageDir.replace("age-", ""));
  for (const subject of SUBJECTS) {
    for (let tier = 1; tier <= 4; tier++) {
      const path = join(QDIR, ageDir, subject, `tier-${tier}.json`);
      let raw;
      try {
        raw = readFileSync(path, "utf8");
      } catch {
        continue;
      }
      const items = JSON.parse(raw);
      if (!Array.isArray(items)) continue;
      for (const q of items) {
        all.push({
          id: q.id,
          subject,
          tier,
          ageSuggestion: age,
          prompt: q.prompt,
          answer: q.answer,
          format: q.format,
          choices: q.choices ?? null,
          skill: q.skill ?? "custom",
          source: "bundled",
        });
      }
    }
  }
}
console.log(`Loaded ${all.length} questions from JSON.`);

// Upsert each question. Drizzle's bulk insert.onConflictDoUpdate would be
// ideal but we're using raw `sql` here for simplicity. Loop is fine —
// we're talking ~800 rows.
let upserted = 0;
for (const q of all) {
  await sql`
    insert into questions (id, subject, tier, age_suggestion, prompt, answer, format, choices, skill, source)
    values (${q.id}, ${q.subject}, ${q.tier}, ${q.ageSuggestion}, ${q.prompt}, ${q.answer}, ${q.format}, ${q.choices ? JSON.stringify(q.choices) : null}::jsonb, ${q.skill}, ${q.source})
    on conflict (id) do update set
      subject = excluded.subject,
      tier = excluded.tier,
      age_suggestion = excluded.age_suggestion,
      prompt = excluded.prompt,
      answer = excluded.answer,
      format = excluded.format,
      choices = excluded.choices,
      skill = excluded.skill,
      source = excluded.source
  `;
  upserted++;
  if (upserted % 100 === 0) console.log(`  upserted ${upserted}/${all.length}…`);
}
console.log(`Upserted ${upserted} questions.`);

// Ensure the Default bank exists.
const [defaultBank] = await sql`
  insert into banks (name) values ('Default')
  on conflict (name) do update set updated_at = now()
  returning id
`;
console.log(`Default bank id: ${defaultBank.id}`);

// Repopulate Default's question links from the questions we just upserted.
// Wipe first so questions removed from JSON aren't dangling.
await sql`delete from bank_questions where bank_id = ${defaultBank.id}`;
const ids = all.map((q) => q.id);
if (ids.length > 0) {
  // Bulk insert in chunks of 500.
  const chunkSize = 500;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const values = chunk.map((id) => `(${defaultBank.id}, '${id.replace(/'/g, "''")}')`).join(",");
    await sql.query(`insert into bank_questions (bank_id, question_id) values ${values}`);
  }
}
console.log(`Linked ${ids.length} questions to Default bank.`);

// Assign any user without a bank to Default.
const updated = await sql`
  update users set bank_id = ${defaultBank.id}
  where bank_id is null and role = 'player'
  returning username
`;
console.log(`Assigned Default bank to ${updated.length} unassigned player(s):`, updated.map((u) => u.username));

console.log("Seed complete.");
process.exit(0);
