// Generates Pri 4–6 math questions aligned to the Singapore MOE primary
// math syllabus. Output: data/questions/age-12/math/tier-{1..4}.json
// (overwrites). The seed-banks.mjs classifier picks them up by skill.
//
// Pri 4 (age 10): decimals (1-2 places), factors/multiples, simple
//   fractions arithmetic, area/perimeter rectangles, time, angles
// Pri 5 (age 11): percentage, ratio, fractions × whole, decimal
//   multiplication, mean
// Pri 6 (age 12): algebra (linear), speed/distance/time, ratio
//   problems, percentage change, area of circle (using pi=3.14)

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "questions", "age-12", "math");
mkdirSync(OUT, { recursive: true });

let seq = 0;
function id(prefix) {
  seq++;
  return `${prefix}-${seq}`;
}

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

function mc(skill, prompt, answer, distractors, tier) {
  const ans = String(answer);
  const choices = shuffle(uniq([ans, ...distractors.map(String)])).slice(0, 4);
  if (!choices.includes(ans)) choices[0] = ans;
  return {
    id: id(`p${tier}-${skill}`),
    tier,
    skill,
    format: "multiple_choice",
    prompt,
    answer: ans,
    choices: shuffle(choices),
  };
}

function pad(skill, prompt, answer, tier) {
  return {
    id: id(`p${tier}-${skill}`),
    tier,
    skill,
    format: "number_pad",
    prompt,
    answer: String(answer),
  };
}

const T1 = []; // Pri 4-friendly basic Pokemon questions
const T2 = []; // Pri 4 stage-1
const T3 = []; // Pri 5 final-form
const T4 = []; // Pri 6 legendaries

// =================================================================
// PRI 4 — decimals, factors, fractions, area/perimeter
// (Tier 1 = basic Pokemon, simpler within the Pri-4 set)
// =================================================================

// Decimals — addition/subtraction (Pri 4)
for (let i = 0; i < 18; i++) {
  const a = (Math.floor(Math.random() * 50) + 10) / 10; // 1.0–6.0
  const b = (Math.floor(Math.random() * 30) + 5) / 10;
  const ans = +(a + b).toFixed(1);
  T1.push(pad("decimals_addition", `${a.toFixed(1)} + ${b.toFixed(1)} = ?`, ans, 1));
}
for (let i = 0; i < 12; i++) {
  const a = (Math.floor(Math.random() * 50) + 30) / 10;
  const b = (Math.floor(Math.random() * 25) + 5) / 10;
  const ans = +(a - b).toFixed(1);
  T1.push(pad("decimals_subtraction", `${a.toFixed(1)} - ${b.toFixed(1)} = ?`, ans, 1));
}

// Factors / multiples — Pri 4 basics (Tier 2 ish)
for (const n of [12, 18, 20, 24, 30, 36, 48, 60]) {
  const factors = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
  T2.push(
    mc(
      "factors",
      `How many factors does ${n} have?`,
      factors.length,
      [factors.length + 1, factors.length - 1, factors.length + 2],
      2,
    ),
  );
}
for (const [n, m] of [[3, 4], [4, 6], [5, 6], [6, 8], [8, 12], [9, 12]]) {
  let lcm = 1;
  while (!(lcm % n === 0 && lcm % m === 0)) lcm++;
  T2.push(
    mc(
      "multiples_lcm",
      `What is the lowest common multiple of ${n} and ${m}?`,
      lcm,
      [lcm + n, lcm - n, lcm + m],
      2,
    ),
  );
}

// Simple fractions arithmetic (Pri 4)
const fracPairs = [
  [1, 2, 1, 4],
  [1, 3, 1, 6],
  [1, 4, 1, 8],
  [2, 3, 1, 6],
  [3, 4, 1, 8],
  [1, 5, 2, 5],
  [2, 7, 3, 7],
  [1, 4, 3, 4],
];
for (const [a, b, c, d] of fracPairs) {
  // a/b + c/d (common denominators only for Pri 4 simplicity)
  if (b === d) {
    const num = a + c;
    T2.push(
      mc(
        "fractions_add",
        `${a}/${b} + ${c}/${d} = ?`,
        `${num}/${b}`,
        [`${num}/${b * 2}`, `${a + c}/${b + d}`, `${num + 1}/${b}`],
        2,
      ),
    );
  }
}

// Area / perimeter rectangle (Pri 4)
for (let i = 0; i < 8; i++) {
  const w = Math.floor(Math.random() * 8) + 3;
  const h = Math.floor(Math.random() * 8) + 3;
  T2.push(
    pad("area_rectangle", `A rectangle is ${w} cm × ${h} cm. Its area in cm² = ?`, w * h, 2),
  );
}
for (let i = 0; i < 6; i++) {
  const w = Math.floor(Math.random() * 10) + 4;
  const h = Math.floor(Math.random() * 10) + 4;
  T2.push(
    pad(
      "perimeter_rectangle",
      `A rectangle is ${w} cm × ${h} cm. Its perimeter in cm = ?`,
      2 * (w + h),
      2,
    ),
  );
}

// Time conversion (Pri 4)
for (const [hr, min] of [[1, 30], [2, 15], [3, 45], [4, 20], [5, 50]]) {
  const total = hr * 60 + min;
  T1.push(pad("time_minutes", `${hr} h ${min} min = ___ minutes`, total, 1));
}

// Angles on a straight line (Pri 4)
for (const a of [40, 55, 70, 85, 100, 115, 130]) {
  T2.push(
    mc(
      "angles_straight",
      `Two angles on a straight line. One is ${a}°. What is the other?`,
      180 - a,
      [180 - a + 10, 180 - a - 10, 360 - a],
      2,
    ),
  );
}

// =================================================================
// PRI 5 — percentage, ratio, fractions × whole, decimal × decimal
// (Tier 3 = final-form Pokemon, harder Pri-5 questions)
// =================================================================

// Percentage of an amount
for (const [pct, of] of [[10, 50], [20, 80], [25, 200], [50, 60], [75, 80], [40, 150], [15, 40]]) {
  const ans = (pct * of) / 100;
  T3.push(
    mc(
      "percentage_of",
      `What is ${pct}% of ${of}?`,
      ans,
      [ans + 5, ans - 5, ans * 2],
      3,
    ),
  );
}

// Ratio simplification
for (const [a, b] of [[4, 6], [6, 9], [10, 15], [12, 18], [8, 20], [9, 12], [14, 21]]) {
  let g = a;
  while (b % g !== 0 || a % g !== 0) g--;
  const sa = a / g;
  const sb = b / g;
  T3.push(
    mc(
      "ratio_simplify",
      `Simplify ${a}:${b}`,
      `${sa}:${sb}`,
      [`${sa + 1}:${sb}`, `${a}:${b}`, `${sa}:${sb + 1}`],
      3,
    ),
  );
}

// Fraction × whole number
for (const [num, den, whole] of [
  [1, 2, 10],
  [1, 3, 18],
  [2, 3, 15],
  [3, 4, 20],
  [1, 5, 25],
  [2, 5, 30],
  [3, 8, 40],
  [5, 6, 18],
]) {
  const ans = (num * whole) / den;
  T3.push(pad("fractions_x_whole", `${num}/${den} × ${whole} = ?`, ans, 3));
}

// Decimal × whole
for (let i = 0; i < 8; i++) {
  const a = (Math.floor(Math.random() * 50) + 10) / 10;
  const b = Math.floor(Math.random() * 8) + 2;
  const ans = +(a * b).toFixed(2);
  T3.push(pad("decimal_x_whole", `${a.toFixed(1)} × ${b} = ?`, ans, 3));
}

// Mean (average)
const meanSets = [
  [4, 6, 8, 10],
  [12, 14, 16, 18],
  [5, 10, 15, 20, 25],
  [3, 7, 8, 10],
  [20, 30, 40],
  [2, 4, 8, 10, 16],
];
for (const set of meanSets) {
  const mean = set.reduce((a, b) => a + b, 0) / set.length;
  T3.push(pad("mean", `Find the mean of ${set.join(", ")}`, mean, 3));
}

// =================================================================
// PRI 6 — algebra, speed, area of circle, percentage change
// (Tier 4 = legendaries, Pri 6 hardest)
// =================================================================

// Linear algebra — solve for x
for (const [a, b, c] of [
  [3, 5, 11], // 3x + 5 = 11 → x = 2
  [2, 7, 17],
  [5, 4, 24],
  [4, 9, 25],
  [6, 3, 27],
  [7, 1, 22],
  [8, 6, 30],
]) {
  // a*x + b = c
  const x = (c - b) / a;
  T4.push(
    mc(
      "algebra_linear",
      `If ${a}x + ${b} = ${c}, what is x?`,
      x,
      [x + 1, x - 1, x + 2],
      4,
    ),
  );
}
for (const [a, b, c] of [
  [4, 1, 13],
  [5, 2, 17],
  [3, 4, 22],
]) {
  // a*x - b = c → x = (c+b)/a
  const x = (c + b) / a;
  T4.push(
    mc(
      "algebra_linear",
      `If ${a}x - ${b} = ${c}, what is x?`,
      x,
      [x + 1, x - 1, x + 2],
      4,
    ),
  );
}

// Speed / distance / time
for (const [d, t] of [[100, 2], [120, 3], [150, 5], [240, 4], [60, 2], [180, 3]]) {
  T4.push(
    pad("speed", `A car travels ${d} km in ${t} hours. Its speed in km/h = ?`, d / t, 4),
  );
}
for (const [s, t] of [[60, 3], [80, 2], [50, 4]]) {
  T4.push(
    pad("distance", `Speed ${s} km/h for ${t} hours. Distance in km = ?`, s * t, 4),
  );
}

// Area of circle (pi=3.14, radius given)
for (const r of [2, 3, 5, 10, 4, 6]) {
  const ans = +(3.14 * r * r).toFixed(2);
  T4.push(
    pad(
      "area_circle",
      `Area of a circle with radius ${r} cm (use π = 3.14). cm² = ?`,
      ans,
      4,
    ),
  );
}

// Percentage change / increase
for (const [orig, pct] of [[200, 10], [150, 20], [80, 25], [300, 15]]) {
  const inc = (orig * pct) / 100;
  T4.push(
    mc(
      "percentage_increase",
      `${orig} increases by ${pct}%. New value = ?`,
      orig + inc,
      [orig - inc, orig + inc * 2, orig + pct],
      4,
    ),
  );
}

// Ratio problems with totals
for (const [a, b, total] of [[2, 3, 100], [3, 5, 80], [4, 1, 50], [3, 7, 150]]) {
  const partA = (a / (a + b)) * total;
  T4.push(
    mc(
      "ratio_total",
      `Ratio ${a}:${b}, total = ${total}. The first part = ?`,
      partA,
      [partA + 10, partA - 10, total - partA],
      4,
    ),
  );
}

// =================================================================
// Bonus T1/T2 Pri 4-light content (so basic Pokemon at higher Pri
// banks still serve sensible content rather than cumulating only
// Pri 1-3 from the bundled banks). These hit Pri 4 difficulty.
// =================================================================

// Multi-step arithmetic (Pri 4 light — basic Pokemon)
for (let i = 0; i < 12; i++) {
  const a = Math.floor(Math.random() * 80) + 20;
  const b = Math.floor(Math.random() * 60) + 10;
  const c = Math.floor(Math.random() * 40) + 5;
  T1.push(pad("multi_step_addition", `${a} + ${b} + ${c} = ?`, a + b + c, 1));
}
for (let i = 0; i < 8; i++) {
  const a = Math.floor(Math.random() * 200) + 100;
  const b = Math.floor(Math.random() * 80) + 20;
  const c = Math.floor(Math.random() * 50) + 10;
  T1.push(pad("multi_step_subtraction", `${a} - ${b} - ${c} = ?`, a - b - c, 1));
}

// =================================================================
// WRITE
// =================================================================

const banks = { 1: T1, 2: T2, 3: T3, 4: T4 };
for (const [tier, bank] of Object.entries(banks)) {
  writeFileSync(
    join(OUT, `tier-${tier}.json`),
    JSON.stringify(bank, null, 2) + "\n",
  );
  console.log(`age-12 math tier ${tier}: ${bank.length} questions`);
}
