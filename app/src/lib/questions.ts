import mathTier1 from "../../data/questions/math/tier-1.json";
import mathTier2 from "../../data/questions/math/tier-2.json";
import mathTier3 from "../../data/questions/math/tier-3.json";
import mathTier4 from "../../data/questions/math/tier-4.json";
import englishTier1 from "../../data/questions/english/tier-1.json";
import englishTier2 from "../../data/questions/english/tier-2.json";
import englishTier3 from "../../data/questions/english/tier-3.json";
import englishTier4 from "../../data/questions/english/tier-4.json";
import chineseTier1 from "../../data/questions/chinese/tier-1.json";
import chineseTier2 from "../../data/questions/chinese/tier-2.json";
import chineseTier3 from "../../data/questions/chinese/tier-3.json";
import chineseTier4 from "../../data/questions/chinese/tier-4.json";

import { FALLBACK_SUBJECT, type SubjectId } from "./subjects";

export type QuestionFormat = "multiple_choice" | "number_pad";

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

// Static registry of every subject × tier bank we know about.
// Drop 2 will fill in the english/chinese banks; for now they're empty.
const BANKS: Record<SubjectId, Record<Tier, Question[]>> = {
  math: {
    1: mathTier1 as Question[],
    2: mathTier2 as Question[],
    3: mathTier3 as Question[],
    4: mathTier4 as Question[],
  },
  english: {
    1: englishTier1 as Question[],
    2: englishTier2 as Question[],
    3: englishTier3 as Question[],
    4: englishTier4 as Question[],
  },
  chinese: {
    1: chineseTier1 as Question[],
    2: chineseTier2 as Question[],
    3: chineseTier3 as Question[],
    4: chineseTier4 as Question[],
  },
};

const ALL_BY_ID = new Map<string, Question>();
for (const subjectBanks of Object.values(BANKS)) {
  for (const tier of [1, 2, 3, 4] as const) {
    for (const q of subjectBanks[tier]) ALL_BY_ID.set(q.id, q);
  }
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_BY_ID.get(id);
}

// Resolve which bank to actually serve from. If the requested subject's
// bank for this tier is empty (e.g. english/chinese before Drop 2 seeds them),
// fall back to the configured fallback subject (math) so the kid never
// sees an empty modal.
function resolveBank(subject: SubjectId, tier: Tier): Question[] {
  const wanted = BANKS[subject]?.[tier];
  if (wanted && wanted.length > 0) return wanted;
  return BANKS[FALLBACK_SUBJECT]?.[tier] ?? [];
}

export function getBank(subject: SubjectId, tier: Tier): Question[] {
  return resolveBank(subject, tier);
}

export type QuestionHistoryEntry = {
  id: string;
  correct: boolean;
  ts: number;
  // Encounters since this question last appeared (for spaced-repetition decay)
  reviewCounter?: number;
};

export type QuestionHistory = Record<string, QuestionHistoryEntry>;

// Spaced repetition: missed questions resurface after ~1, then ~3, then ~7 encounters.
// 1. If there's a "due" review (previously missed, reviewCounter ticked down to 0), surface it.
// 2. Otherwise pick a fresh (never-seen) question from the bank.
// 3. Otherwise pick any random question.
export function pickQuestion(
  subject: SubjectId,
  tier: Tier,
  history: QuestionHistory,
): Question {
  const bank = resolveBank(subject, tier);
  const due = bank.filter((q) => {
    const h = history[q.id];
    return h && !h.correct && (h.reviewCounter ?? 0) <= 0;
  });
  if (due.length > 0) return due[Math.floor(Math.random() * due.length)];

  const fresh = bank.filter((q) => !history[q.id]);
  if (fresh.length > 0) return fresh[Math.floor(Math.random() * fresh.length)];

  return bank[Math.floor(Math.random() * bank.length)];
}

// After answering, update history. Decrement reviewCounters on OTHER outstanding questions.
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
