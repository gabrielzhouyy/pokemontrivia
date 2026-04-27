"use client";
import { useEffect, useState } from "react";
import {
  getAdminSubjectsOverride,
  getBundledSubjects,
  setAdminSubjectsOverride,
  syncSubjectsFromCloud,
  type Subject,
} from "@/lib/subjects";

type EditableSubject = {
  id: string;
  label: string;
  lo: string; // string for editable inputs; null/empty allowed
  hi: string;
};

function fromSubject(s: Subject): EditableSubject {
  return {
    id: s.id,
    label: s.label,
    lo: s.pokemon_range ? String(s.pokemon_range[0]) : "",
    hi: s.pokemon_range ? String(s.pokemon_range[1]) : "",
  };
}

function toConfig(items: EditableSubject[], fallback: string) {
  return {
    subjects: items.map((it) => ({
      id: it.id,
      label: it.label,
      pokemon_range:
        it.lo && it.hi ? ([Number(it.lo), Number(it.hi)] as [number, number]) : null,
    })),
    fallback_subject: fallback,
  };
}

export default function SubjectsTab() {
  const [items, setItems] = useState<EditableSubject[]>([]);
  const [fallback, setFallback] = useState("math");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [usingOverride, setUsingOverride] = useState(false);

  useEffect(() => {
    (async () => {
      // Pull latest from cloud first so a different device's edits show up.
      await syncSubjectsFromCloud();
      const override = getAdminSubjectsOverride();
      const bundled = getBundledSubjects();
      if (override) {
        setItems(override.subjects.map(fromSubject));
        setFallback(override.fallback_subject);
        setUsingOverride(true);
      } else {
        setItems(bundled.subjects.map(fromSubject));
        setFallback(bundled.fallback_subject);
        setUsingOverride(false);
      }
    })();
  }, []);

  function update(idx: number, patch: Partial<EditableSubject>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function add() {
    setItems((prev) => [...prev, { id: "new-subject", label: "New", lo: "", hi: "" }]);
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    const cfg = toConfig(items, fallback);
    await setAdminSubjectsOverride(cfg);
    setSavedAt(Date.now());
    setUsingOverride(true);
  }

  async function revertToBundled() {
    if (!confirm("Discard your overrides and use the bundled subjects.json?")) return;
    await setAdminSubjectsOverride(null);
    const b = getBundledSubjects();
    setItems(b.subjects.map(fromSubject));
    setFallback(b.fallback_subject);
    setUsingOverride(false);
  }

  function exportJson() {
    const cfg = toConfig(items, fallback);
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subjects.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-extrabold">Subject ranges</h2>
        {usingOverride && (
          <span className="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded-full">
            Using local override
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">
        First match wins. Range is inclusive. Subjects with no range are skipped during lookup
        (use this for &quot;ad-hoc&quot; until you assign Pokemon to it).
      </p>

      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <input
              value={it.id}
              onChange={(e) => update(idx, { id: e.target.value })}
              className="sm:col-span-3 p-2 border-2 border-gray-300 rounded-xl text-sm"
              placeholder="id (e.g. math)"
            />
            <input
              value={it.label}
              onChange={(e) => update(idx, { label: e.target.value })}
              className="sm:col-span-3 p-2 border-2 border-gray-300 rounded-xl text-sm"
              placeholder="Label"
            />
            <input
              type="number"
              value={it.lo}
              onChange={(e) => update(idx, { lo: e.target.value })}
              className="sm:col-span-2 p-2 border-2 border-gray-300 rounded-xl text-sm text-center"
              placeholder="from"
            />
            <input
              type="number"
              value={it.hi}
              onChange={(e) => update(idx, { hi: e.target.value })}
              className="sm:col-span-2 p-2 border-2 border-gray-300 rounded-xl text-sm text-center"
              placeholder="to"
            />
            <button
              onClick={() => remove(idx)}
              className="sm:col-span-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-bold py-2 active:scale-95 transition"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={add}
          className="bg-yellow-200 hover:bg-yellow-300 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
        >
          + Add subject
        </button>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-bold">Fallback:</span>
          <input
            value={fallback}
            onChange={(e) => setFallback(e.target.value)}
            className="p-2 border-2 border-gray-300 rounded-xl text-sm w-28"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mt-6 items-center">
        <button
          onClick={save}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
        >
          Save (live)
        </button>
        <button
          onClick={exportJson}
          className="bg-blue-200 hover:bg-blue-300 px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
        >
          Export subjects.json
        </button>
        {usingOverride && (
          <button
            onClick={revertToBundled}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
          >
            Revert to bundled
          </button>
        )}
        {savedAt && (
          <span className="text-sm text-green-600 font-bold">
            Saved at {new Date(savedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
