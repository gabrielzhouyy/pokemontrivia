import subjectsData from "../../data/subjects.json";

export type SubjectId = string;

export type Subject = {
  id: SubjectId;
  label: string;
  pokemon_range: [number, number]; // inclusive on both ends
};

type SubjectsConfig = {
  subjects: Subject[];
  fallback_subject: SubjectId;
};

const CONFIG = subjectsData as SubjectsConfig;

const BY_ID = new Map(CONFIG.subjects.map((s) => [s.id, s]));

export const SUBJECTS: Subject[] = CONFIG.subjects;
export const FALLBACK_SUBJECT: SubjectId = CONFIG.fallback_subject;

export function getSubject(id: SubjectId): Subject | undefined {
  return BY_ID.get(id);
}

// Look up which subject a Pokemon belongs to based on its dex id.
// Falls back to the configured fallback subject if no range matches.
export function subjectFor(pokemonId: number): SubjectId {
  for (const s of CONFIG.subjects) {
    const [lo, hi] = s.pokemon_range;
    if (pokemonId >= lo && pokemonId <= hi) return s.id;
  }
  return CONFIG.fallback_subject;
}
