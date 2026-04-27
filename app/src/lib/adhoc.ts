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

// Push the entire overlay to the cloud (admin-only). Best-effort: on
// failure we keep the local change but warn. Called by every mutating
// helper below, so every admin edit also persists server-side.
async function pushToCloud(data: AdhocOverlay): Promise<void> {
  try {
    await fetch("/api/admin/adhoc", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overlay: data }),
    });
  } catch {
    // Offline — local copy persists. Drop 4d will add a "stuck local"
    // indicator so the dad knows there's an unsynced edit.
  }
}

// Pull the latest overlay from the cloud and write it to localStorage.
// Called from loadCurrentProfile so every session sees the latest edits.
export async function syncAdhocFromCloud(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/config/adhoc", { cache: "no-store" });
    if (!res.ok) return;
    const j = (await res.json()) as { overlay: AdhocOverlay };
    save(j.overlay ?? {});
  } catch {
    // Offline → keep local cache.
  }
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
  void pushToCloud(data);
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
