"use client";
import { useEffect, useState } from "react";

type Question = {
  id: string;
  subject: string;
  priLevel: number;
  prompt: string;
  answer: string;
  choices: string[] | null;
  explanation: string | null;
};

type EditState = {
  subject: string;
  priLevel: number;
  prompt: string;
  answer: string;
  choices: string; // newline-separated
  explanation: string;
};

const DIFFICULTY: Record<number, string> = {
  1: "Easy (PreK–K)",
  2: "Medium (Grade 1–3)",
  3: "Hard (Grade 4–5)",
  4: "Very Hard (Adult)",
};

const SUBJECT_LABEL: Record<string, string> = {
  math: "Math",
  singapore_trivia: "Singapore",
};

function blankEdit(priLevel = 1, subject = "singapore_trivia"): EditState {
  return { subject, priLevel, prompt: "", answer: "", choices: "", explanation: "" };
}

function toEditState(q: Question): EditState {
  return {
    subject: q.subject,
    priLevel: q.priLevel,
    prompt: q.prompt,
    answer: q.answer,
    choices: (q.choices ?? []).join("\n"),
    explanation: q.explanation ?? "",
  };
}

export default function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [filterPriLevel, setFilterPriLevel] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // editingId = question id being edited, "new" for add form, null for none
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>(blankEdit());
  const [savedMsg, setSavedMsg] = useState("");

  async function refresh() {
    setError("");
    const params = new URLSearchParams();
    if (filterPriLevel) params.set("priLevel", filterPriLevel);
    if (filterSubject) params.set("subject", filterSubject);
    const res = await fetch(`/api/admin/questions?${params}`, { cache: "no-store" });
    if (!res.ok) { setError("Failed to load questions"); setQuestions([]); return; }
    const j = (await res.json()) as { questions: Question[] };
    setQuestions(j.questions);
  }

  useEffect(() => { refresh(); }, [filterPriLevel, filterSubject]); // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(q: Question) {
    setEditingId(q.id);
    setEditState(toEditState(q));
  }

  function startAdd() {
    setEditingId("new");
    setEditState(blankEdit(filterPriLevel ? Number(filterPriLevel) : 1, filterSubject || "singapore_trivia"));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function save() {
    const choices = editState.choices
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);
    if (!editState.prompt.trim() || !editState.answer.trim()) {
      setError("Prompt and answer are required");
      return;
    }
    if (choices.length < 2) {
      setError("Need at least 2 choices");
      return;
    }

    setBusy(true);
    setError("");
    const body = {
      subject: editState.subject,
      priLevel: editState.priLevel,
      prompt: editState.prompt,
      answer: editState.answer,
      choices,
      explanation: editState.explanation,
    };

    let res: Response;
    if (editingId === "new") {
      res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`/api/admin/questions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setBusy(false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Save failed");
      return;
    }
    setEditingId(null);
    setSavedMsg("Saved ✓");
    setTimeout(() => setSavedMsg(""), 600);
    refresh();
  }

  async function del(id: string, prompt: string) {
    if (!confirm(`Delete this question?\n\n"${prompt}"`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) setError("Delete failed");
    else refresh();
  }

  function field(label: string, node: React.ReactNode) {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-gray-600">{label}</span>
        {node}
      </label>
    );
  }

  const editForm = (
    <div className="border-2 border-blue-300 rounded-2xl p-4 bg-blue-50 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {field("Difficulty",
          <select
            value={editState.priLevel}
            onChange={(e) => setEditState({ ...editState, priLevel: Number(e.target.value) })}
            className="p-2 border-2 border-gray-300 rounded-xl text-sm"
          >
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{DIFFICULTY[n]}</option>)}
          </select>
        )}
        {field("Subject",
          <select
            value={editState.subject}
            onChange={(e) => setEditState({ ...editState, subject: e.target.value })}
            className="p-2 border-2 border-gray-300 rounded-xl text-sm"
          >
            <option value="math">Math</option>
            <option value="singapore_trivia">Singapore</option>
          </select>
        )}
      </div>
      {field("Prompt",
        <textarea
          value={editState.prompt}
          onChange={(e) => setEditState({ ...editState, prompt: e.target.value })}
          rows={3}
          className="p-2 border-2 border-gray-300 rounded-xl text-sm resize-none"
        />
      )}
      {field("Correct answer",
        <input
          value={editState.answer}
          onChange={(e) => setEditState({ ...editState, answer: e.target.value })}
          className="p-2 border-2 border-gray-300 rounded-xl text-sm"
        />
      )}
      {field("Choices (one per line — correct answer must be one of them)",
        <textarea
          value={editState.choices}
          onChange={(e) => setEditState({ ...editState, choices: e.target.value })}
          rows={4}
          className="p-2 border-2 border-gray-300 rounded-xl text-sm font-mono resize-none"
          placeholder={"Choice A\nChoice B\nChoice C\nChoice D"}
        />
      )}
      {field("Explanation (optional — shown after answering)",
        <textarea
          value={editState.explanation}
          onChange={(e) => setEditState({ ...editState, explanation: e.target.value })}
          rows={3}
          className="p-2 border-2 border-gray-300 rounded-xl text-sm resize-none"
          placeholder="Fun fact or context shown after the player answers…"
        />
      )}
      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          onClick={cancelEdit}
          className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 font-bold text-sm active:scale-95 transition"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={busy}
          className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold text-sm active:scale-95 transition"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-extrabold">Questions</h2>
        <select
          value={filterPriLevel}
          onChange={(e) => { setFilterPriLevel(e.target.value); setEditingId(null); }}
          className="p-2 border-2 border-gray-300 rounded-xl text-sm"
        >
          <option value="">All difficulties</option>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{DIFFICULTY[n]}</option>)}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => { setFilterSubject(e.target.value); setEditingId(null); }}
          className="p-2 border-2 border-gray-300 rounded-xl text-sm"
        >
          <option value="">All subjects</option>
          <option value="math">Math</option>
          <option value="singapore_trivia">Singapore</option>
        </select>
        {savedMsg && <span className="text-green-600 font-bold text-sm">{savedMsg}</span>}
        <button
          onClick={startAdd}
          className="ml-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl font-bold text-sm active:scale-95 transition"
        >
          + Add question
        </button>
      </div>

      {editingId === "new" && editForm}

      {questions === null && <p className="text-gray-500 text-center py-8">Loading…</p>}
      {questions !== null && questions.length === 0 && (
        <p className="text-gray-500 text-center py-8">No questions found. Add one above or adjust filters.</p>
      )}

      {(questions ?? []).map((q) => (
        <div key={q.id}>
          {editingId === q.id ? (
            editForm
          ) : (
            <div
              onClick={() => startEdit(q)}
              className="border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-3 flex items-start gap-3 cursor-pointer active:scale-[0.99] transition"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug line-clamp-2">{q.prompt}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    {DIFFICULTY[q.priLevel] ?? `Level ${q.priLevel}`}
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">
                    {SUBJECT_LABEL[q.subject] ?? q.subject}
                  </span>
                  {q.explanation && (
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                      has explanation
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); del(q.id, q.prompt); }}
                disabled={busy}
                className="bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 px-3 py-1.5 rounded-xl text-sm font-bold active:scale-95 transition shrink-0"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
