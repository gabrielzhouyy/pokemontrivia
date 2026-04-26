"use client";
import type { QuestionHistory } from "./questions";
import { POKEMON } from "./pokemon";

// New shape (Drop 1c): one entry per species id.
// `evolved: true` means this species line was evolved past — it stays in the
// Pokedex frozen at its evolve level and is no longer trainable.
export type OwnedPokemon = {
  level: number;
  evolved: boolean;
};

// Old (pre-Drop-1c) shape — kept here only so loadProfile can migrate.
type OwnedPokemonV1 = {
  id: number;
  level: number;
  speciesId: number;
};

export type Profile = {
  username: string;
  pin: string;
  starterId: number | null;
  // Set of species IDs the player has obtained (caught in wild OR via evolution).
  caught: number[];
  // One entry per owned species, keyed by species id directly.
  owned: Record<number, OwnedPokemon>;
  // Set of base species IDs the player has evolved at least once
  // (used for "first evolution" / "evolve all" stats).
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

// Detect + migrate v1 owned shape to v2. The v1 shape was keyed by base species
// id with an indirect `speciesId` pointing to the current evolved form. Split
// each v1 entry into two v2 entries: base id locked at evolve_level, evolved
// id active at the current level.
function migrateOwned(profile: Profile): Profile {
  const ownedAny = profile.owned as unknown as Record<number, unknown>;
  const sample = Object.values(ownedAny)[0];
  const isV1 =
    sample &&
    typeof sample === "object" &&
    "speciesId" in (sample as object) &&
    "id" in (sample as object);
  if (!isV1) return profile;

  const newOwned: Record<number, OwnedPokemon> = {};
  const newCaught = new Set<number>(profile.caught);
  for (const [, entry] of Object.entries(ownedAny)) {
    const v1 = entry as OwnedPokemonV1;
    if (v1.id === v1.speciesId) {
      // Never evolved — single entry.
      newOwned[v1.id] = { level: v1.level, evolved: false };
      newCaught.add(v1.id);
    } else {
      // Was evolved: walk the chain from v1.id to v1.speciesId, freezing
      // intermediate forms at their evolve_level.
      let cur = v1.id;
      while (cur !== v1.speciesId) {
        const sp = POKEMON.find((p) => p.id === cur);
        if (!sp || sp.evolves_to === null || sp.evolve_level === null) break;
        newOwned[cur] = { level: sp.evolve_level, evolved: true };
        newCaught.add(cur);
        cur = sp.evolves_to;
      }
      newOwned[v1.speciesId] = { level: v1.level, evolved: false };
      newCaught.add(v1.speciesId);
    }
  }
  return { ...profile, owned: newOwned, caught: Array.from(newCaught) };
}

export function loadProfile(username: string): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(profileKey(username));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Profile;
    const migrated = migrateOwned(parsed);
    if (migrated !== parsed) {
      // Persist migration so it only runs once.
      localStorage.setItem(profileKey(username), JSON.stringify(migrated));
    }
    return migrated;
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
