"use client";
import { useEffect, useState } from "react";
import {
  addAdhocQuestion,
  deleteAdhocQuestion,
  getAdhocBank,
  importAdhocBank,
  syncAdhocFromCloud,
  SEEDED_AGES,
  type SeededAge,
} from "@/lib/adhoc";
import type { Question, QuestionFormat } from "@/lib/questions";

const TIERS = [1, 2, 3, 4] as const;
type Tier = (typeof TIERS)[number];

export default function AdhocTab() {
  const [age, setAge] = useState<SeededAge>(SEEDED_AGES[0]);
  const [tier, setTier] = useState<Tier>(1);
  const [bank, setBank] = useState<Question[]>([]);

  // New-question form state
  const [format, setFormat] = useState<QuestionFormat>("multiple_choice");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [skill, setSkill] = useState("custom");
  const [choicesText, setChoicesText] = useState("");
  const [error, setError] = useState("");

  function refresh() {
    setBank(getAdhocBank(age, tier));
  }

  useEffect(() => {
    (async () => {
      await syncAdhocFromCloud();
      refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age, tier]);

  function reset() {
    setPrompt("");
    setAnswer("");
    setChoicesText("");
    setSkill("custom");
    setError("");
  }

  function add() {
    setError("");
    if (!prompt.trim()) return setError("Prompt is required");
    if (!answer.trim()) return setError("Answer is required");
    let choices: string[] | undefined;
    if (format === "multiple_choice") {
      choices = choicesText
        .split(/[\n,]/)
        .map((c) => c.trim())
        .filter(Boolean);
      if (choices.length < 2) return setError("MC needs at least 2 choices");
      if (!choices.includes(answer.trim())) {
        choices = [answer.trim(), ...choices];
      }
    }
    const q: Question = {
      id: `adhoc-${age}-t${tier}-${Date.now().toString(36)}`,
      tier,
      skill: skill || "custom",
      prompt: prompt.trim(),
      answer: answer.trim(),
      format,
      ...(choices ? { choices } : {}),
    };
    addAdhocQuestion(age, tier, q);
    reset();
    refresh();
  }

  function del(id: string) {
    if (!confirm("Delete this question?")) return;
    deleteAdhocQuestion(age, tier, id);
    refresh();
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as Question[];
      if (!Array.isArray(parsed)) throw new Error("Top-level must be an array");
      const mode = confirm("Replace bank? Cancel = merge by id") ? "replace" : "merge";
      importAdhocBank(age, tier, parsed, mode);
      refresh();
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : err}`);
    }
    e.target.value = "";
  }

  function exportThisBank() {
    const blob = new Blob([JSON.stringify(bank, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adhoc-age${age}-tier${tier}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold mb-3">General questions</h2>
      <p className="text-sm text-gray-600 mb-4">
        Authored questions live here. Map a Pokemon range to subject &quot;general&quot; in the
        Subjects tab to use them in encounters.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-bold">Age</span>
          <select
            value={age}
            onChange={(e) => setAge(Number(e.target.value) as SeededAge)}
            className="p-2 border-2 border-gray-300 rounded-xl text-sm"
          >
            {SEEDED_AGES.map((a) => (
              <option key={a} value={a}>
                age-{a}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm font-bold">Tier</span>
          <select
            value={tier}
            onChange={(e) => setTier(Number(e.target.value) as Tier)}
            className="p-2 border-2 border-gray-300 rounded-xl text-sm"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                Tier {t}
              </option>
            ))}
          </select>
        </label>
        <label className="ml-auto bg-blue-200 hover:bg-blue-300 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition cursor-pointer">
          Import JSON
          <input type="file" accept="application/json" onChange={onImportFile} className="hidden" />
        </label>
        <button
          onClick={exportThisBank}
          className="bg-blue-200 hover:bg-blue-300 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
        >
          Export this bank
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 mb-6">
        <h3 className="font-extrabold mb-2">Add a question</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold">Format</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as QuestionFormat)}
              className="p-2 border-2 border-gray-300 rounded-xl text-sm"
            >
              <option value="multiple_choice">Multiple choice</option>
              <option value="number_pad">Number pad</option>
              <option value="text_pad">Text pad (A-Z)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold">Skill (free text)</span>
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="p-2 border-2 border-gray-300 rounded-xl text-sm"
              placeholder="custom"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-bold">Prompt</span>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="p-2 border-2 border-gray-300 rounded-xl text-sm"
              placeholder="e.g. What is 5 + 3?"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold">Answer</span>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="p-2 border-2 border-gray-300 rounded-xl text-sm"
              placeholder="e.g. 8 or HOUSE"
            />
          </label>
          {format === "multiple_choice" && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold">
                Choices (comma or newline; answer auto-included)
              </span>
              <textarea
                value={choicesText}
                onChange={(e) => setChoicesText(e.target.value)}
                rows={2}
                className="p-2 border-2 border-gray-300 rounded-xl text-sm"
                placeholder="e.g. 6, 7, 9"
              />
            </label>
          )}
        </div>
        {error && <p className="text-red-500 font-bold mt-2 text-sm">{error}</p>}
        <div className="flex gap-2 mt-3">
          <button
            onClick={add}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
          >
            + Add question
          </button>
          <button
            onClick={reset}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <h3 className="font-extrabold mb-2">
        Bank: age-{age}, tier {tier} ({bank.length} question{bank.length === 1 ? "" : "s"})
      </h3>
      {bank.length === 0 ? (
        <p className="text-sm text-gray-500">No questions yet — add some above.</p>
      ) : (
        <ul className="space-y-2">
          {bank.map((q) => (
            <li
              key={q.id}
              className="border-2 border-gray-200 rounded-2xl p-3 flex flex-wrap items-center gap-3"
            >
              <div className="flex-1 min-w-[200px]">
                <div className="font-bold">{q.prompt}</div>
                <div className="text-xs text-gray-500">
                  {q.format} · ans: <span className="font-mono">{q.answer}</span>
                  {q.choices && <> · choices: {q.choices.join(", ")}</>}
                </div>
              </div>
              <button
                onClick={() => del(q.id)}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-xl text-sm font-bold active:scale-95 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
