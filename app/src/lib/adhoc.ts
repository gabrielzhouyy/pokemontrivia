"use client";
import type { Question } from "./questions";
import { SEEDED_AGES, type SeededAge } from "./questions";

const KEY = "pmc:admin:adhoc";

type Tier = 1 | 2 | 3 | 4;
// Shape: { "age-7": { "1": [Q,...], ... }, "age-12": {...} }
type AdhocOverlay = Record<string, Record<string, Question[]>>;

function load(): AdhocOverlay {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdhocOverlay) : {};
  } catch {
    return {};
  }
}

function save(data: AdhocOverlay): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAdhocBank(age: SeededAge, tier: Tier): Question[] {
  const data = load();
  return data[`age-${age}`]?.[String(tier)] ?? [];
}

export function setAdhocBank(age: SeededAge, tier: Tier, qs: Question[]): void {
  const data = load();
  if (!data[`age-${age}`]) data[`age-${age}`] = {};
  data[`age-${age}`][String(tier)] = qs;
  save(data);
}

export function addAdhocQuestion(age: SeededAge, tier: Tier, q: Question): void {
  const bank = getAdhocBank(age, tier);
  setAdhocBank(age, tier, [...bank, q]);
}

export function deleteAdhocQuestion(age: SeededAge, tier: Tier, id: string): void {
  const bank = getAdhocBank(age, tier);
  setAdhocBank(
    age,
    tier,
    bank.filter((q) => q.id !== id),
  );
}

export function exportAdhocAll(): AdhocOverlay {
  return load();
}

export function importAdhocBank(
  age: SeededAge,
  tier: Tier,
  qs: Question[],
  mode: "replace" | "merge",
): void {
  if (mode === "replace") {
    setAdhocBank(age, tier, qs);
  } else {
    const existing = getAdhocBank(age, tier);
    const byId = new Map(existing.map((q) => [q.id, q]));
    for (const q of qs) byId.set(q.id, q);
    setAdhocBank(age, tier, Array.from(byId.values()));
  }
}

export { SEEDED_AGES, type SeededAge };
