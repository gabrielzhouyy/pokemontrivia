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

export function getSubjects(): Subject[] {
  return BUNDLED.subjects;
}

export function getFallbackSubject(): SubjectId {
  return BUNDLED.fallback_subject;
}

// Backwards-compatible exports (still importable from existing call sites).
export const SUBJECTS: Subject[] = BUNDLED.subjects;
export const FALLBACK_SUBJECT: SubjectId = BUNDLED.fallback_subject;

export function getSubject(id: SubjectId): Subject | undefined {
  return BUNDLED.subjects.find((s) => s.id === id);
}

// Look up which subject a Pokemon belongs to. First-match-wins. Subjects
// with null range are skipped.
export function subjectFor(pokemonId: number): SubjectId {
  for (const s of BUNDLED.subjects) {
    if (s.parity === "odd"  && pokemonId % 2 === 1) return s.id;
    if (s.parity === "even" && pokemonId % 2 === 0) return s.id;
    if (!s.pokemon_range) continue;
    const [lo, hi] = s.pokemon_range;
    if (pokemonId >= lo && pokemonId <= hi) return s.id;
  }
  return BUNDLED.fallback_subject;
}

export function getBundledSubjects(): SubjectsConfig {
  return BUNDLED;
}
