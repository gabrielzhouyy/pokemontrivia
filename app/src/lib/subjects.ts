import subjectsData from "../../data/subjects.json";

export type SubjectId = string;

export type Subject = {
  id: SubjectId;
  label: string;
  // Inclusive range. `null` means "not assigned to any Pokemon by default"
  // — the dad still has to map it via Oak's range editor (typical for ad-hoc).
  pokemon_range: [number, number] | null;
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
    if (!s.pokemon_range) continue;
    const [lo, hi] = s.pokemon_range;
    if (pokemonId >= lo && pokemonId <= hi) return s.id;
  }
  return cfg.fallback_subject;
}

// Save Oak's edits. Pass `null` to clear the override.
export function setAdminSubjectsOverride(cfg: SubjectsConfig | null): void {
  if (typeof window === "undefined") return;
  if (cfg === null) {
    localStorage.removeItem("pmc:admin:subjects");
  } else {
    localStorage.setItem("pmc:admin:subjects", JSON.stringify(cfg));
  }
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

export function getBundledSubjects(): SubjectsConfig {
  return BUNDLED;
}
