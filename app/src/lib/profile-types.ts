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
  age: number;
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

export const DEFAULT_AGE = 7;

export function newProfile(username: string, pin: string): Profile {
  return {
    username,
    pin,
    starterId: null,
    age: DEFAULT_AGE,
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
