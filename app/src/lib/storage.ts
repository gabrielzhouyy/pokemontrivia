"use client";
import type { QuestionHistory } from "./questions";

export type OwnedPokemon = {
  id: number;
  level: number;
  // Pokedex tracks the species line — for evolutions we keep the *current* form id here.
  speciesId: number;
};

export type Profile = {
  username: string;
  pin: string;
  starterId: number | null;
  // Caught: set of base-species IDs the player has ever caught.
  caught: number[];
  // Owned: one slot per caught species line. Stores current evolution + level.
  owned: Record<number, OwnedPokemon>; // keyed by ORIGINAL caught id (the species line root)
  // Evolved: set of species IDs the player has evolved at least once.
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

const KEY_PREFIX = "pmc:profile:";
const KEY_CURRENT = "pmc:current";

export function profileKey(username: string) {
  return KEY_PREFIX + username.toLowerCase();
}

export function loadProfile(username: string): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(profileKey(username));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(profileKey(profile.username), JSON.stringify(profile));
  localStorage.setItem(KEY_CURRENT, profile.username);
}

export function getCurrentUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY_CURRENT);
}

export function loadCurrentProfile(): Profile | null {
  const u = getCurrentUsername();
  return u ? loadProfile(u) : null;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_CURRENT);
}

export function newProfile(username: string, pin: string): Profile {
  return {
    username,
    pin,
    starterId: null,
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
