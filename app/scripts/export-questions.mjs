// Exports all questions from the Neon DB back to the bundled JSON files.
// Run this BEFORE making code changes to preserve any admin edits.
// Usage: cd app && node scripts/export-questions.mjs
import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.local") });
loadEnv({ path: join(__dirname, "..", ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(url);

const FOLDER = { 1: "prek-k", 2: "grade-1-3", 3: "grade-4-5", 4: "adult" };

const rows = await sql`
  SELECT id, subject, pri_level, prompt, answer, format, choices, explanation
  FROM questions
  ORDER BY pri_level, subject, id
`;

// Group by priLevel + subject
const groups = new Map();
for (const row of rows) {
  const folder = FOLDER[row.pri_level];
  if (!folder) continue;
  const key = `${folder}/${row.subject}`;
  if (!groups.has(key)) groups.set(key, { folder, subject: row.subject, questions: [] });
  const q = { id: row.id, prompt: row.prompt, answer: row.answer };
  if (row.choices && row.choices.length > 0) q.choices = row.choices;
  if (row.explanation) q.explanation = row.explanation;
  groups.get(key).questions.push(q);
}

const base = join(__dirname, "..", "data", "questions", "curriculum");

for (const { folder, subject, questions } of groups.values()) {
  const dir = join(base, folder);
  mkdirSync(dir, { recursive: true });
  const filePath = join(dir, `${subject}.json`);
  writeFileSync(filePath, JSON.stringify(questions, null, 2) + "\n");
  console.log(`  ${folder}/${subject}.json — ${questions.length} questions`);
}

console.log(`\nDone. ${rows.length} questions exported.`);
process.exit(0);
