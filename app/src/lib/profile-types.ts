// Shared Profile types used by both client (storage.ts) and server
// (api/profile/route.ts). No runtime side effects or "use client" — safe
// to import from anywhere.

import type { QuestionHistory } from "./questions";

export type OwnedPokemon = {
  level: number;
  evolved: boolean;
};

export type Profile = {
  username: string;
  // PIN never round-trips from server; this is just the field shape.
  pin: string;
  starterId: number | null;
  // Difficulty level: 1=preK–K, 2=1st–3rd Grade, 3=4th–5th Grade, 4=Adult.
  priLevel: number;
  caught: number[];
  owned: Record<number, OwnedPokemon>;
  evolved: number[];
  history: QuestionHistory;
  stats: {
    totalAnswered: number;
    correct: number;
    currentStreak: number;
    longestStreak: number;
  };
  createdAt: number;
};

export const DEFAULT_PRI_LEVEL = 1;
export const PRI_LEVELS = [1, 2, 3, 4] as const;
export type PriLevel = (typeof PRI_LEVELS)[number];

export function newProfile(username: string, pin: string): Profile {
  return {
    username,
    pin,
    starterId: null,
    priLevel: DEFAULT_PRI_LEVEL,
    caught: [],
    owned: {},
    evolved: [],
    history: {},
    stats: {
      totalAnswered: 0,
      correct: 0,
      currentStreak: 0,
      longestStreak: 0,
    },
    createdAt: Date.now(),
  };
}
