// Drop 5c: questions are sourced from the cloud via /api/config/bank
// and cached in localStorage. No more bundled JSON imports — the master
// pool + bank assignments live in Postgres. Drop 5b's seed script is
// the bridge that backfilled the bundled questions there.

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

type CachedBank = {
  bankId: number | null;
  bankName?: string;
  questions: Array<Question & { subject: SubjectId; ageSuggestion?: number }>;
  fetchedAt: number;
};

const CACHE_KEY = "pmc:bank:active";

function readCache(): CachedBank | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedBank) : null;
  } catch {
    return null;
  }
}

function writeCache(b: CachedBank): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(b));
}

// Pull the current user's bank from the server. Called by storage.ts on
// every loadCurrentProfile so cross-device admin edits propagate after
// the kid's next page load.
export async function syncBankFromCloud(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/config/bank", { cache: "no-store" });
    if (!res.ok) return;
    const j = (await res.json()) as {
      bankId: number | null;
      bankName?: string;
      questions: Array<Question & { subject: string; ageSuggestion?: number }>;
    };
    writeCache({
      bankId: j.bankId,
      bankName: j.bankName,
      questions: (j.questions ?? []) as CachedBank["questions"],
      fetchedAt: Date.now(),
    });
  } catch {
    // Offline → keep whatever's already cached.
  }
}

// Filter the cached bank for the (subject, tier) the encounter needs.
// Falls back to the configured fallback subject (e.g. "math") if the
// requested subject has no questions in the bank.
function bankFor(subject: SubjectId, tier: Tier): Question[] {
  const cache = readCache();
  if (!cache || cache.questions.length === 0) return [];
  const exact = cache.questions.filter((q) => q.subject === subject && q.tier === tier);
  if (exact.length > 0) return exact;
  return cache.questions.filter((q) => q.subject === FALLBACK_SUBJECT && q.tier === tier);
}

export function getBank(subject: SubjectId, tier: Tier): Question[] {
  return bankFor(subject, tier);
}

export type QuestionHistoryEntry = {
  id: string;
  correct: boolean;
  ts: number;
  // Encounters since this question last appeared (for spaced-repetition decay)
  reviewCounter?: number;
};

export type QuestionHistory = Record<string, QuestionHistoryEntry>;

// Spaced repetition: missed questions resurface after a few encounters.
// 1. Surface a "due" review (previously missed, reviewCounter ticked to 0).
// 2. Else pick a fresh (never-seen) question from the bank.
// 3. Else pick any random question.
export function pickQuestion(
  subject: SubjectId,
  tier: Tier,
  history: QuestionHistory,
): Question | null {
  const bank = bankFor(subject, tier);
  if (bank.length === 0) return null;

  const due = bank.filter((q) => {
    const h = history[q.id];
    return h && !h.correct && (h.reviewCounter ?? 0) <= 0;
  });
  if (due.length > 0) return due[Math.floor(Math.random() * due.length)];

  const fresh = bank.filter((q) => !history[q.id]);
  if (fresh.length > 0) return fresh[Math.floor(Math.random() * fresh.length)];

  return bank[Math.floor(Math.random() * bank.length)];
}

// Look up by id across the cached bank (used to render review prompts etc).
export function getQuestionById(id: string): Question | undefined {
  const cache = readCache();
  if (!cache) return undefined;
  return cache.questions.find((q) => q.id === id);
}

// After answering, update history. Decrement reviewCounters on OTHER
// outstanding questions.
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
