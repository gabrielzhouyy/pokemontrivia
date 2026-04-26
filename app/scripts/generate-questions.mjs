// Generates question banks for each tier. Hand-rolled for v1; later swap for an LLM call.
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function makeMC(prompt, answer, distractors) {
  const choices = shuffle(uniq([String(answer), ...distractors.map(String)])).slice(0, 4);
  if (!choices.includes(String(answer))) choices[0] = String(answer);
  return { prompt, answer: String(answer), format: "multiple_choice", choices: shuffle(choices) };
}

function makePad(prompt, answer) {
  return { prompt, answer: String(answer), format: "number_pad" };
}

// ---- Tier 1: addition/subtraction within 10 (multiple choice) ----
const tier1 = [];
for (let a = 0; a <= 10; a++) {
  for (let b = 0; b <= 10 - a; b++) {
    const ans = a + b;
    const distractors = [ans + 1, ans - 1, ans + 2].filter((n) => n >= 0 && n !== ans);
    tier1.push({
      id: `t1-add-${a}-${b}`,
      tier: 1,
      skill: "addition_within_10",
      ...makeMC(`${a} + ${b} = ?`, ans, distractors),
    });
  }
}
for (let a = 0; a <= 10; a++) {
  for (let b = 0; b <= a; b++) {
    const ans = a - b;
    const distractors = [ans + 1, ans - 1, ans + 2].filter((n) => n >= 0 && n !== ans);
    tier1.push({
      id: `t1-sub-${a}-${b}`,
      tier: 1,
      skill: "subtraction_within_10",
      ...makeMC(`${a} - ${b} = ?`, ans, distractors),
    });
  }
}

// ---- Tier 2: addition/subtraction within 20 + skip counting ----
const tier2 = [];
for (let a = 5; a <= 20; a++) {
  for (let b = 1; b <= 20 - a && b <= 12; b++) {
    const ans = a + b;
    const distractors = [ans + 1, ans - 1, ans + 2, ans - 2].filter((n) => n >= 0 && n !== ans);
    tier2.push({
      id: `t2-add-${a}-${b}`,
      tier: 2,
      skill: "addition_within_20",
      ...makeMC(`${a} + ${b} = ?`, ans, distractors),
    });
  }
}
for (let a = 10; a <= 20; a++) {
  for (let b = 2; b <= a; b++) {
    const ans = a - b;
    const distractors = [ans + 1, ans - 1, ans + 2, ans - 2].filter((n) => n >= 0 && n !== ans);
    tier2.push({
      id: `t2-sub-${a}-${b}`,
      tier: 2,
      skill: "subtraction_within_20",
      ...makeMC(`${a} - ${b} = ?`, ans, distractors),
    });
  }
}
// Skip counting (number pad)
for (const step of [2, 5, 10]) {
  for (let i = 1; i <= 10; i++) {
    const seq = [i * step, (i + 1) * step, (i + 2) * step];
    const next = (i + 3) * step;
    tier2.push({
      id: `t2-skip${step}-${i}`,
      tier: 2,
      skill: "skip_counting",
      ...makePad(`${seq.join(", ")}, ___?`, next),
    });
  }
}

// ---- Tier 3: within 100 + multiplication 2/5/10 ----
const tier3 = [];
for (let i = 0; i < 60; i++) {
  const a = 10 + Math.floor(Math.random() * 70);
  const b = 5 + Math.floor(Math.random() * 25);
  const ans = a + b;
  tier3.push({
    id: `t3-add-${i}`,
    tier: 3,
    skill: "addition_within_100",
    ...makePad(`${a} + ${b} = ?`, ans),
  });
}
for (let i = 0; i < 40; i++) {
  const a = 30 + Math.floor(Math.random() * 60);
  const b = 5 + Math.floor(Math.random() * (a - 5));
  const ans = a - b;
  tier3.push({
    id: `t3-sub-${i}`,
    tier: 3,
    skill: "subtraction_within_100",
    ...makePad(`${a} - ${b} = ?`, ans),
  });
}
for (const k of [2, 5, 10]) {
  for (let i = 1; i <= 12; i++) {
    const ans = k * i;
    const distractors = [ans + k, ans - k, ans + 1, ans - 1].filter((n) => n > 0 && n !== ans);
    tier3.push({
      id: `t3-mult-${k}x${i}`,
      tier: 3,
      skill: `multiplication_${k}x`,
      ...makeMC(`${k} × ${i} = ?`, ans, distractors),
    });
  }
}

// ---- Tier 4: legendary-tier — mixed, harder ----
const tier4 = [];
// Harder multiplication
for (const k of [3, 4, 6, 7, 8, 9]) {
  for (let i = 2; i <= 10; i++) {
    const ans = k * i;
    const distractors = [ans + k, ans - k, ans + 1, ans - 1].filter((n) => n > 0 && n !== ans);
    tier4.push({
      id: `t4-mult-${k}x${i}`,
      tier: 4,
      skill: `multiplication_${k}x`,
      ...makeMC(`${k} × ${i} = ?`, ans, distractors),
    });
  }
}
// Place value
for (let i = 0; i < 30; i++) {
  const n = 100 + Math.floor(Math.random() * 900);
  const ones = n % 10;
  const tens = Math.floor(n / 10) % 10;
  const hundreds = Math.floor(n / 100);
  const choice = Math.floor(Math.random() * 3);
  if (choice === 0) {
    tier4.push({
      id: `t4-pv-ones-${i}`,
      tier: 4,
      skill: "place_value",
      ...makePad(`In the number ${n}, what digit is in the ones place?`, ones),
    });
  } else if (choice === 1) {
    tier4.push({
      id: `t4-pv-tens-${i}`,
      tier: 4,
      skill: "place_value",
      ...makePad(`In the number ${n}, what digit is in the tens place?`, tens),
    });
  } else {
    tier4.push({
      id: `t4-pv-hundreds-${i}`,
      tier: 4,
      skill: "place_value",
      ...makePad(`In the number ${n}, what digit is in the hundreds place?`, hundreds),
    });
  }
}
// Simple fractions of a number
for (const denom of [2, 4, 5, 10]) {
  for (let m = 1; m <= 10; m++) {
    const total = denom * m;
    const ans = m;
    const distractors = [ans + 1, ans - 1, total, denom].filter((n) => n > 0 && n !== ans);
    tier4.push({
      id: `t4-frac-1over${denom}-of-${total}`,
      tier: 4,
      skill: "fractions_of_number",
      ...makeMC(`What is 1/${denom} of ${total}?`, ans, distractors),
    });
  }
}

const banks = { 1: tier1, 2: tier2, 3: tier3, 4: tier4 };
for (const [tier, bank] of Object.entries(banks)) {
  writeFileSync(
    join(__dirname, "..", "data", "questions", "age-7", "math", `tier-${tier}.json`),
    JSON.stringify(bank, null, 2) + "\n",
  );
  console.log(`Math tier ${tier}: ${bank.length} questions`);
}
