// Age-7 banks (the only seeded bucket today).
import a7MathT1 from "../../data/questions/age-7/math/tier-1.json";
import a7MathT2 from "../../data/questions/age-7/math/tier-2.json";
import a7MathT3 from "../../data/questions/age-7/math/tier-3.json";
import a7MathT4 from "../../data/questions/age-7/math/tier-4.json";
import a7EnT1 from "../../data/questions/age-7/english/tier-1.json";
import a7EnT2 from "../../data/questions/age-7/english/tier-2.json";
import a7EnT3 from "../../data/questions/age-7/english/tier-3.json";
import a7EnT4 from "../../data/questions/age-7/english/tier-4.json";
import a7ZhT1 from "../../data/questions/age-7/chinese/tier-1.json";
import a7ZhT2 from "../../data/questions/age-7/chinese/tier-2.json";
import a7ZhT3 from "../../data/questions/age-7/chinese/tier-3.json";
import a7ZhT4 from "../../data/questions/age-7/chinese/tier-4.json";
import a7AdT1 from "../../data/questions/age-7/ad-hoc/tier-1.json";
import a7AdT2 from "../../data/questions/age-7/ad-hoc/tier-2.json";
import a7AdT3 from "../../data/questions/age-7/ad-hoc/tier-3.json";
import a7AdT4 from "../../data/questions/age-7/ad-hoc/tier-4.json";

// Age-12 banks (empty stubs; admin can populate via Oak).
import a12MathT1 from "../../data/questions/age-12/math/tier-1.json";
import a12MathT2 from "../../data/questions/age-12/math/tier-2.json";
import a12MathT3 from "../../data/questions/age-12/math/tier-3.json";
import a12MathT4 from "../../data/questions/age-12/math/tier-4.json";
import a12EnT1 from "../../data/questions/age-12/english/tier-1.json";
import a12EnT2 from "../../data/questions/age-12/english/tier-2.json";
import a12EnT3 from "../../data/questions/age-12/english/tier-3.json";
import a12EnT4 from "../../data/questions/age-12/english/tier-4.json";
import a12ZhT1 from "../../data/questions/age-12/chinese/tier-1.json";
import a12ZhT2 from "../../data/questions/age-12/chinese/tier-2.json";
import a12ZhT3 from "../../data/questions/age-12/chinese/tier-3.json";
import a12ZhT4 from "../../data/questions/age-12/chinese/tier-4.json";
import a12AdT1 from "../../data/questions/age-12/ad-hoc/tier-1.json";
import a12AdT2 from "../../data/questions/age-12/ad-hoc/tier-2.json";
import a12AdT3 from "../../data/questions/age-12/ad-hoc/tier-3.json";
import a12AdT4 from "../../data/questions/age-12/ad-hoc/tier-4.json";

import { FALLBACK_SUBJECT, type SubjectId } from "./subjects";

export type QuestionFormat = "multiple_choice" | "number_pad" | "text_pad";

export type Question = {
  id: string;
  tier: 1 | 2 | 3 | 4;
  skill: string;
  prompt: string;
  answer: string;
  format: QuestionFormat;
  choices?: string[];
};

type Tier = 1 | 2 | 3 | 4;

// Age buckets we have seeded folders for. Add a row here when you seed
// a new age-N folder of bundled questions.
export const SEEDED_AGES = [7, 12] as const;
export type SeededAge = (typeof SEEDED_AGES)[number];

type SubjectBank = Record<Tier, Question[]>;
type AgeBank = Record<SubjectId, SubjectBank>;

const BUNDLED: Record<SeededAge, AgeBank> = {
  7: {
    math: { 1: a7MathT1 as Question[], 2: a7MathT2 as Question[], 3: a7MathT3 as Question[], 4: a7MathT4 as Question[] },
    english: { 1: a7EnT1 as Question[], 2: a7EnT2 as Question[], 3: a7EnT3 as Question[], 4: a7EnT4 as Question[] },
    chinese: { 1: a7ZhT1 as Question[], 2: a7ZhT2 as Question[], 3: a7ZhT3 as Question[], 4: a7ZhT4 as Question[] },
    "ad-hoc": { 1: a7AdT1 as Question[], 2: a7AdT2 as Question[], 3: a7AdT3 as Question[], 4: a7AdT4 as Question[] },
  },
  12: {
    math: { 1: a12MathT1 as Question[], 2: a12MathT2 as Question[], 3: a12MathT3 as Question[], 4: a12MathT4 as Question[] },
    english: { 1: a12EnT1 as Question[], 2: a12EnT2 as Question[], 3: a12EnT3 as Question[], 4: a12EnT4 as Question[] },
    chinese: { 1: a12ZhT1 as Question[], 2: a12ZhT2 as Question[], 3: a12ZhT3 as Question[], 4: a12ZhT4 as Question[] },
    "ad-hoc": { 1: a12AdT1 as Question[], 2: a12AdT2 as Question[], 3: a12AdT3 as Question[], 4: a12AdT4 as Question[] },
  },
};

// Sort seeded ages by distance to the kid's age (closest first).
function seededAgesByDistance(age: number): SeededAge[] {
  return [...SEEDED_AGES].sort((a, b) => Math.abs(age - a) - Math.abs(age - b));
}

// Read admin-authored ad-hoc overlay from localStorage (Oak's UI writes here).
// Shape: { "age-7": { "1": [Q,...], "2": [...], ... }, "age-12": {...} }
function readAdminAdhocOverlay(age: SeededAge, tier: Tier): Question[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("pmc:admin:adhoc");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, Record<string, Question[]>>;
    return parsed[`age-${age}`]?.[String(tier)] ?? [];
  } catch {
    return [];
  }
}

const ALL_BY_ID = new Map<string, Question>();
for (const ageBank of Object.values(BUNDLED)) {
  for (const subjectBank of Object.values(ageBank)) {
    for (const tier of [1, 2, 3, 4] as const) {
      for (const q of subjectBank[tier]) ALL_BY_ID.set(q.id, q);
    }
  }
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_BY_ID.get(id);
}

// Resolve which bank to actually serve from. Tries each seeded age (closest
// first), checking both the requested subject and the configured fallback
// subject at each. Returns the first non-empty.
function resolveBank(age: number, subject: SubjectId, tier: Tier): Question[] {
  const ages = seededAgesByDistance(age);
  for (const a of ages) {
    const ageBank = BUNDLED[a];
    if (!ageBank) continue;
    let bank = ageBank[subject]?.[tier] ?? [];
    if (subject === "ad-hoc") {
      bank = [...bank, ...readAdminAdhocOverlay(a, tier)];
    }
    if (bank.length > 0) return bank;
  }
  // Final fallback: the configured fallback subject at the closest seeded age.
  for (const a of ages) {
    const ageBank = BUNDLED[a];
    const bank = ageBank?.[FALLBACK_SUBJECT]?.[tier];
    if (bank && bank.length > 0) return bank;
  }
  return [];
}

export function getBank(age: number, subject: SubjectId, tier: Tier): Question[] {
  return resolveBank(age, subject, tier);
}

export type QuestionHistoryEntry = {
  id: string;
  correct: boolean;
  ts: number;
  // Encounters since this question last appeared (for spaced-repetition decay)
  reviewCounter?: number;
};

export type QuestionHistory = Record<string, QuestionHistoryEntry>;

export function pickQuestion(
  age: number,
  subject: SubjectId,
  tier: Tier,
  history: QuestionHistory,
): Question {
  const bank = resolveBank(age, subject, tier);
  const due = bank.filter((q) => {
    const h = history[q.id];
    return h && !h.correct && (h.reviewCounter ?? 0) <= 0;
  });
  if (due.length > 0) return due[Math.floor(Math.random() * due.length)];

  const fresh = bank.filter((q) => !history[q.id]);
  if (fresh.length > 0) return fresh[Math.floor(Math.random() * fresh.length)];

  return bank[Math.floor(Math.random() * bank.length)];
}

export function recordAnswer(
  history: QuestionHistory,
  questionId: string,
  correct: boolean,
): QuestionHistory {
  const next: QuestionHistory = {};
  for (const [id, h] of Object.entries(history)) {
    if (id === questionId) continue;
    next[id] = {
      ...h,
      reviewCounter: Math.max(0, (h.reviewCounter ?? 0) - 1),
    };
  }
  if (correct) {
    next[questionId] = { id: questionId, correct: true, ts: Date.now() };
  } else {
    next[questionId] = { id: questionId, correct: false, ts: Date.now(), reviewCounter: 1 };
  }
  return next;
}
