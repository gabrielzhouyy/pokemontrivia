import subjectsData from "../../data/subjects.json";

export type SubjectId = string;

export type Subject = {
  id: SubjectId;
  label: string;
  // Inclusive range. `null` means "not assigned to any Pokemon by default"
  // — the dad still has to map it via Oak's range editor (typical for ad-hoc).
  pokemon_range: [number, number] | null;
  // Optional parity-based routing: "odd" matches odd IDs, "even" matches even.
  parity?: "odd" | "even";
};

type SubjectsConfig = {
  subjects: Subject[];
  fallback_subject: SubjectId;
};

const BUNDLED: SubjectsConfig = subjectsData as SubjectsConfig;

// Read admin override (Oak's UI writes here). Falls back to bundled config.
function activeConfig(): SubjectsConfig {
  if (typeof window === "undefined") return BUNDLED;
  try {
    const raw = localStorage.getItem("pmc:admin:subjects");
    if (!raw) return BUNDLED;
    const override = JSON.parse(raw) as SubjectsConfig;
    return override.subjects && override.subjects.length > 0 ? override : BUNDLED;
  } catch {
    return BUNDLED;
  }
}

export function getSubjects(): Subject[] {
  return activeConfig().subjects;
}

export function getFallbackSubject(): SubjectId {
  return activeConfig().fallback_subject;
}

// Backwards-compatible exports (still importable from existing call sites).
export const SUBJECTS: Subject[] = BUNDLED.subjects;
export const FALLBACK_SUBJECT: SubjectId = BUNDLED.fallback_subject;

export function getSubject(id: SubjectId): Subject | undefined {
  return activeConfig().subjects.find((s) => s.id === id);
}

// Look up which subject a Pokemon belongs to. First-match-wins on the
// active config (admin override, or bundled if no override). Subjects
// with null range are skipped.
export function subjectFor(pokemonId: number): SubjectId {
  const cfg = activeConfig();
  for (const s of cfg.subjects) {
    if (s.parity === "odd"  && pokemonId % 2 === 1) return s.id;
    if (s.parity === "even" && pokemonId % 2 === 0) return s.id;
    if (!s.pokemon_range) continue;
    const [lo, hi] = s.pokemon_range;
    if (pokemonId >= lo && pokemonId <= hi) return s.id;
  }
  return cfg.fallback_subject;
}

// Save Oak's edits. Pass `null` to clear the override. Writes to BOTH
// localStorage (for instant local effect) and the cloud (admin-only PUT)
// so changes propagate to other devices.
export async function setAdminSubjectsOverride(cfg: SubjectsConfig | null): Promise<void> {
  if (typeof window !== "undefined") {
    if (cfg === null) {
      localStorage.removeItem("pmc:admin:subjects");
    } else {
      localStorage.setItem("pmc:admin:subjects", JSON.stringify(cfg));
    }
  }
  await fetch("/api/admin/subjects", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config: cfg }),
  });
}

export function getAdminSubjectsOverride(): SubjectsConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pmc:admin:subjects");
    return raw ? (JSON.parse(raw) as SubjectsConfig) : null;
  } catch {
    return null;
  }
}

// Pull the latest override from the cloud and write it to localStorage.
// Called from loadCurrentProfile so every player session gets the fresh config.
export async function syncSubjectsFromCloud(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/config/subjects", { cache: "no-store" });
    if (!res.ok) return;
    const j = (await res.json()) as { override: SubjectsConfig | null };
    if (j.override && j.override.subjects && j.override.subjects.length > 0) {
      localStorage.setItem("pmc:admin:subjects", JSON.stringify(j.override));
    } else {
      localStorage.removeItem("pmc:admin:subjects");
    }
  } catch {
    // Offline / network error → keep whatever is in localStorage.
  }
}

export function getBundledSubjects(): SubjectsConfig {
  return BUNDLED;
}
