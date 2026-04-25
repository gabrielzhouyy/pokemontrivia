import tier1 from "../../data/questions/tier-1.json";
import tier2 from "../../data/questions/tier-2.json";
import tier3 from "../../data/questions/tier-3.json";
import tier4 from "../../data/questions/tier-4.json";

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

const BANKS: Record<1 | 2 | 3 | 4, Question[]> = {
  1: tier1 as Question[],
  2: tier2 as Question[],
  3: tier3 as Question[],
  4: tier4 as Question[],
};

const ALL_BY_ID = new Map<string, Question>();
for (const tier of [1, 2, 3, 4] as const) {
  for (const q of BANKS[tier]) ALL_BY_ID.set(q.id, q);
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_BY_ID.get(id);
}

export function getBank(tier: 1 | 2 | 3 | 4): Question[] {
  return BANKS[tier];
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
// We pick a question for `tier` like this:
//   1. If there's a "due" review (a previously-missed question whose reviewCounter has counted down to 0),
//      surface it.
//   2. Otherwise, pick a fresh (never-seen-this-session) question from the tier bank.
//   3. Otherwise, pick any random question from the tier bank.
export function pickQuestion(tier: 1 | 2 | 3 | 4, history: QuestionHistory): Question {
  const bank = BANKS[tier];
  // Reviews due (incorrect last time, reviewCounter <= 0)
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
    // Missed: schedule for re-review in 1 encounter.
    next[questionId] = { id: questionId, correct: false, ts: Date.now(), reviewCounter: 1 };
  }
  return next;
}
