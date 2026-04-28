"use client";
import { useEffect, useState } from "react";
import {
  getAdminSubjectsOverride,
  getBundledSubjects,
  setAdminSubjectsOverride,
  syncSubjectsFromCloud,
  type Subject,
} from "@/lib/subjects";

// The 4 fixed subjects. Order is preserved as the first-match-wins order
// in the active config.
const SUBJECTS = [
  { id: "math", label: "Math" },
  { id: "singapore_trivia", label: "Singapore" },
] as const;

type SubjectId = (typeof SUBJECTS)[number]["id"];

type EditableRow = {
  id: SubjectId;
  lo: string;
  hi: string;
};

function rowsFromSubjects(subjects: Subject[]): EditableRow[] {
  return SUBJECTS.map((s) => {
    const found = subjects.find((x) => x.id === s.id);
    return {
      id: s.id,
      lo: found?.pokemon_range ? String(found.pokemon_range[0]) : "",
      hi: found?.pokemon_range ? String(found.pokemon_range[1]) : "",
    };
  });
}

function toConfig(rows: EditableRow[], fallback: SubjectId) {
  return {
    subjects: rows.map((r) => ({
      id: r.id,
      label: SUBJECTS.find((s) => s.id === r.id)!.label,
      pokemon_range:
        r.lo && r.hi ? ([Number(r.lo), Number(r.hi)] as [number, number]) : null,
    })),
    fallback_subject: fallback,
  };
}

export default function SubjectsTab() {
  const [rows, setRows] = useState<EditableRow[]>(() => rowsFromSubjects([]));
  const [fallback, setFallback] = useState<SubjectId>("math");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [usingOverride, setUsingOverride] = useState(false);

  useEffect(() => {
    (async () => {
      await syncSubjectsFromCloud();
      const override = getAdminSubjectsOverride();
      const bundled = getBundledSubjects();
      const active = override ?? bundled;
      setRows(rowsFromSubjects(active.subjects));
      const fb = active.fallback_subject as SubjectId;
      setFallback(SUBJECTS.some((s) => s.id === fb) ? fb : "math");
      setUsingOverride(!!override);
    })();
  }, []);

  function update(idx: number, patch: Partial<EditableRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  async function save() {
    const cfg = toConfig(rows, fallback);
    await setAdminSubjectsOverride(cfg);
    setSavedAt(Date.now());
    setUsingOverride(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-extrabold">Subject ranges</h2>
        {usingOverride && (
          <span className="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded-full">
            Using saved override
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">
        First match wins. Range is inclusive. Leave a row empty (no &quot;from&quot;/&quot;to&quot;) to skip
        that subject during lookup.
      </p>

      <div className="space-y-2">
        {rows.map((r, idx) => {
          const subj = SUBJECTS.find((s) => s.id === r.id)!;
          return (
            <div key={r.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-4 font-bold text-sm bg-gray-50 px-3 py-2 rounded-xl border-2 border-gray-200">
                {subj.label}
              </div>
              <input
                type="number"
                value={r.lo}
                onChange={(e) => update(idx, { lo: e.target.value })}
                className="sm:col-span-4 p-2 border-2 border-gray-300 rounded-xl text-sm text-center"
                placeholder="from"
              />
              <input
                type="number"
                value={r.hi}
                onChange={(e) => update(idx, { hi: e.target.value })}
                className="sm:col-span-4 p-2 border-2 border-gray-300 rounded-xl text-sm text-center"
                placeholder="to"
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-5 items-center">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-bold">Fallback:</span>
          <select
            value={fallback}
            onChange={(e) => setFallback(e.target.value as SubjectId)}
            className="p-2 border-2 border-gray-300 rounded-xl text-sm"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 items-center">
        <button
          onClick={save}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
        >
          Save
        </button>
        {savedAt && (
          <span className="text-sm text-green-600 font-bold">
            Saved at {new Date(savedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
