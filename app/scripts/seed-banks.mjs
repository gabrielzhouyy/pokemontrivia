// Seeds the questions table from JSON files, classifies pri_level by skill,
// and rebuilds the 6 bundled "Pri N" banks (cumulative).
//
// Idempotent: re-runs upsert each question, recreates each bank's links.
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

// Classify a question's Pri level (1–6) from its `skill` tag and tier.
// Singapore MOE Primary Math/English/Chinese curriculum (rough bucketing).
function classifyPri(skill, subject, tier) {
  const s = (skill || "").toLowerCase();

  // Math — Pri 1
  if (s.includes("addition_within_10") || s.includes("subtraction_within_10")) return 1;
  // Math — Pri 2
  if (s.includes("addition_within_20") || s.includes("subtraction_within_20")) return 2;
  if (s.includes("skip_counting")) return 2;
  if (s === "multiplication_2x" || s === "multiplication_5x" || s === "multiplication_10x")
    return 2;
  if (s.includes("addition_within_100") || s.includes("subtraction_within_100")) return 2;
  // Math — Pri 3
  if (s.startsWith("multiplication_")) return 3;
  if (s.includes("place_value")) return 3;
  // Math — Pri 4
  if (s === "fractions_of_number" || s === "fractions_add") return 4;
  if (s.startsWith("decimals_")) return 4;
  if (s === "factors" || s === "multiples_lcm") return 4;
  if (s === "area_rectangle" || s === "perimeter_rectangle" || s === "angles_straight") return 4;
  if (s === "time_minutes") return 4;
  if (s === "multi_step_addition" || s === "multi_step_subtraction") return 4;
  // Math — Pri 5
  if (s === "percentage_of" || s === "ratio_simplify") return 5;
  if (s === "fractions_x_whole" || s === "decimal_x_whole" || s === "mean") return 5;
  // Math — Pri 6
  if (s.startsWith("algebra_")) return 6;
  if (s === "speed" || s === "distance") return 6;
  if (s === "area_circle") return 6;
  if (s === "percentage_increase" || s === "ratio_total") return 6;

  // English
  if (subject === "english") {
    if (
      s === "letter_order" ||
      s === "phonics" ||
      s === "spell_cvc" ||
      s === "word_id" ||
      s === "vowels"
    )
      return 1;
    if (
      s === "cloze" ||
      s === "sight_words" ||
      s === "plural" ||
      s === "past_tense" ||
      s === "opposites" ||
      s === "tense_present" ||
      s === "tense_past" ||
      s === "synonym" ||
      s === "antonym" ||
      s === "preposition" ||
      s === "article"
    )
      return 2;
    if (
      s === "conjunction" ||
      s === "compound" ||
      s === "comparison" ||
      s === "vocab" ||
      s === "homophone"
    )
      return 3;
    if (s === "spell_clue" || s === "spell_missing" || s === "spell_copy" || s === "spell_emoji") {
      return tier >= 4 ? 4 : 3;
    }
    if (s === "idiom" || s === "passive") return 5;
    if (s === "conditional" || s === "reported" || s === "vocab_advanced") return 6;
  }

  // Chinese
  if (subject === "chinese") {
    if (s === "char_en2zh" || s === "char_zh2en") return 1;
    if (s === "phrase_en2zh" || s === "phrase_zh2en") return 2;
    if (s.startsWith("family_") || s.startsWith("object_")) return 3;
    if (s.startsWith("sentence_")) return 4;
    // Pri 4-6 additions
    if (s === "family" || s === "verb_basic" || s === "object") return 4;
    if (s === "measure_word" || s === "adjective" || s === "color") return 4;
    if (s === "idiom" || s === "time" || s === "phrase") return 5;
    if (s === "advanced_idiom" || s === "sentence") return 6;
    if (s === "particle" || s === "comparative" || s === "vocab") return 6;
  }

  // Last-resort: tier-based fallback so nothing's accidentally hidden.
  return Math.min(6, Math.max(1, tier));
}

// Read every JSON file and collect questions.
const all = [];
for (const ageDir of readdirSync(QDIR).filter((d) => d.startsWith("age-"))) {
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
          priLevel: classifyPri(q.skill, subject, tier),
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

// Upsert all questions.
let upserted = 0;
for (const q of all) {
  await sql`
    insert into questions (id, subject, tier, pri_level, prompt, answer, format, choices, skill, source)
    values (${q.id}, ${q.subject}, ${q.tier}, ${q.priLevel}, ${q.prompt}, ${q.answer}, ${q.format}, ${q.choices ? JSON.stringify(q.choices) : null}::jsonb, ${q.skill}, ${q.source})
    on conflict (id) do update set
      subject = excluded.subject,
      tier = excluded.tier,
      pri_level = excluded.pri_level,
      prompt = excluded.prompt,
      answer = excluded.answer,
      format = excluded.format,
      choices = excluded.choices,
      skill = excluded.skill,
      source = excluded.source
  `;
  upserted++;
  if (upserted % 200 === 0) console.log(`  upserted ${upserted}/${all.length}…`);
}
console.log(`Upserted ${upserted} questions.`);

// Print pri_level distribution.
const dist = await sql`select pri_level, count(*) as c from questions group by pri_level order by pri_level`;
console.log("Pri-level distribution:", dist);

// Ensure the 6 "Pri N" banks exist.
const banks = {};
for (let n = 1; n <= 6; n++) {
  const [b] = await sql`
    insert into banks (name) values (${`Pri ${n}`})
    on conflict (name) do update set updated_at = now()
    returning id
  `;
  banks[n] = b.id;
}
console.log("Pri banks:", banks);

// Repopulate each Pri N bank's links: STRICT (pri_level = N only).
// Earlier draft used <= N (cumulative); switched to strict per dad's
// preference — each level should drill its own content, no overlap.
for (let n = 1; n <= 6; n++) {
  const bankId = banks[n];
  await sql`delete from bank_questions where bank_id = ${bankId}`;
  const matching = await sql`select id from questions where pri_level = ${n}`;
  if (matching.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < matching.length; i += chunkSize) {
      const chunk = matching.slice(i, i + chunkSize);
      const values = chunk.map((q) => `(${bankId}, '${q.id.replace(/'/g, "''")}')`).join(",");
      await sql.query(`insert into bank_questions (bank_id, question_id) values ${values}`);
    }
  }
  console.log(`  Pri ${n} bank: ${matching.length} questions`);
}

// Migrate any users on the legacy "Default" bank → matching Pri N (by their priLevel).
const [defaultBank] = await sql`select id from banks where name = 'Default'`;
if (defaultBank) {
  let totalMoved = 0;
  for (let n = 1; n <= 6; n++) {
    const moved = await sql`
      update users set bank_id = ${banks[n]}
      where bank_id = ${defaultBank.id} and pri_level = ${n}
      returning username
    `;
    totalMoved += moved.length;
  }
  console.log(`Migrated ${totalMoved} user(s) from Default → matching Pri bank.`);
  // Tear down the Default bank now that nobody references it.
  await sql`delete from banks where id = ${defaultBank.id}`;
  console.log("Removed legacy Default bank.");
}

// Assign any remaining unassigned players → their Pri N bank.
let totalAssigned = 0;
for (let n = 1; n <= 6; n++) {
  const r = await sql`
    update users set bank_id = ${banks[n]}
    where role = 'player' and bank_id is null and pri_level = ${n}
    returning username
  `;
  totalAssigned += r.length;
}
console.log(`Assigned ${totalAssigned} previously-unassigned player(s).`);

console.log("Seed complete.");
process.exit(0);
