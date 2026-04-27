"use client";
import { useEffect, useState } from "react";
import type { QuestionFormat } from "@/lib/questions";

type BankSummary = {
  id: number;
  name: string;
  questionCount: number;
  userCount: number;
  createdAt: number;
};

type BankDetail = {
  id: number;
  name: string;
  createdAt: number;
  questions: Array<{
    id: string;
    subject: string;
    tier: number;
    ageSuggestion: number;
    prompt: string;
    answer: string;
    format: QuestionFormat;
    choices: string[] | null;
    skill: string;
    source: string;
  }>;
  users: Array<{ id: number; username: string }>;
};

type MasterQuestion = BankDetail["questions"][number];

const SUBJECTS = ["math", "english", "chinese", "general"] as const;
const TIERS = [1, 2, 3, 4] as const;
type Subject = (typeof SUBJECTS)[number];
type Tier = (typeof TIERS)[number];

export default function BanksTab() {
  const [banks, setBanks] = useState<BankSummary[] | null>(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<BankDetail | null>(null);
  const [creatingName, setCreatingName] = useState("");

  // Filters for the selected bank's question list.
  const [filterSubject, setFilterSubject] = useState<Subject>("math");
  const [filterTier, setFilterTier] = useState<Tier>(1);

  // Add-question UI state.
  const [addMode, setAddMode] = useState<"existing" | "new">("existing");
  const [masterPool, setMasterPool] = useState<MasterQuestion[] | null>(null);
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");
  const [searchText, setSearchText] = useState("");

  const [newPrompt, setNewPrompt] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newFormat, setNewFormat] = useState<QuestionFormat>("multiple_choice");
  const [newChoices, setNewChoices] = useState("");
  const [newSkill, setNewSkill] = useState("custom");

  async function refreshBanks() {
    setError("");
    const res = await fetch("/api/admin/banks", { cache: "no-store" });
    if (!res.ok) {
      setError("Failed to load banks");
      setBanks([]);
      return;
    }
    const j = (await res.json()) as { banks: BankSummary[] };
    setBanks(j.banks);
    if (j.banks.length > 0 && selectedId === null) setSelectedId(j.banks[0].id);
  }

  async function refreshDetail(id: number) {
    const res = await fetch(`/api/admin/banks/${id}`, { cache: "no-store" });
    if (!res.ok) return;
    const j = (await res.json()) as { bank: BankDetail };
    setDetail(j.bank);
  }

  async function refreshMasterPool() {
    const params = new URLSearchParams({
      subject: filterSubject,
      tier: String(filterTier),
      limit: "200",
    });
    if (searchText.length >= 2) params.set("q", searchText);
    const res = await fetch(`/api/admin/questions?${params}`, { cache: "no-store" });
    if (!res.ok) return;
    const j = (await res.json()) as { questions: MasterQuestion[] };
    setMasterPool(j.questions);
  }

  useEffect(() => {
    refreshBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId !== null) refreshDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    refreshMasterPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSubject, filterTier, searchText]);

  async function createBank() {
    const name = creatingName.trim();
    if (!name) return;
    const res = await fetch("/api/admin/banks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setError("Failed to create bank (name might be taken)");
      return;
    }
    const j = (await res.json()) as { bank: { id: number } };
    setCreatingName("");
    setSelectedId(j.bank.id);
    refreshBanks();
  }

  async function renameBank(name: string) {
    if (!detail) return;
    const res = await fetch(`/api/admin/banks/${detail.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      refreshBanks();
      refreshDetail(detail.id);
    }
  }

  async function deleteBank() {
    if (!detail) return;
    if (
      !confirm(
        `Delete bank "${detail.name}"? Users assigned to it will be moved to the Default bank.`,
      )
    )
      return;
    const res = await fetch(`/api/admin/banks/${detail.id}`, { method: "DELETE" });
    if (res.ok) {
      setSelectedId(null);
      setDetail(null);
      refreshBanks();
    } else {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Failed to delete");
    }
  }

  async function addExisting() {
    if (!detail || !selectedExistingId) return;
    const res = await fetch(`/api/admin/banks/${detail.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ existingId: selectedExistingId }),
    });
    if (res.ok) {
      setSelectedExistingId("");
      refreshDetail(detail.id);
      refreshBanks();
    }
  }

  async function addCustom() {
    if (!detail) return;
    if (!newPrompt.trim() || !newAnswer.trim()) {
      setError("Prompt and answer are required");
      return;
    }
    let choices: string[] | undefined;
    if (newFormat === "multiple_choice") {
      const parsed = newChoices
        .split(/[\n,]/)
        .map((c) => c.trim())
        .filter(Boolean);
      if (parsed.length < 2) {
        setError("MC needs at least 2 choices");
        return;
      }
      choices = parsed.includes(newAnswer.trim()) ? parsed : [newAnswer.trim(), ...parsed];
    }
    const res = await fetch(`/api/admin/banks/${detail.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        custom: {
          subject: filterSubject,
          tier: filterTier,
          prompt: newPrompt.trim(),
          answer: newAnswer.trim(),
          format: newFormat,
          choices,
          skill: newSkill,
        },
      }),
    });
    if (res.ok) {
      setNewPrompt("");
      setNewAnswer("");
      setNewChoices("");
      refreshDetail(detail.id);
      refreshBanks();
    } else {
      setError("Failed to add custom question");
    }
  }

  async function unlink(qid: string) {
    if (!detail) return;
    const res = await fetch(
      `/api/admin/banks/${detail.id}/questions?questionId=${encodeURIComponent(qid)}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      refreshDetail(detail.id);
      refreshBanks();
    }
  }

  if (banks === null) return <div className="text-center text-gray-500 py-10">Loading banks…</div>;

  const filteredBankQuestions = (detail?.questions ?? []).filter(
    (q) => q.subject === filterSubject && q.tier === filterTier,
  );

  // Master-pool dropdown should hide questions already in this bank.
  const inBankIds = new Set(detail?.questions.map((q) => q.id) ?? []);
  const masterChoices = (masterPool ?? []).filter((q) => !inBankIds.has(q.id));

  return (
    <div>
      <h2 className="text-xl font-extrabold mb-3">Question banks</h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: bank list + create */}
        <aside className="md:col-span-4 space-y-2">
          <div className="border-2 border-gray-200 rounded-2xl p-3">
            <div className="text-sm font-bold mb-2">Banks</div>
            {banks.length === 0 && <p className="text-sm text-gray-500">No banks yet.</p>}
            {banks.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`w-full text-left px-3 py-2 rounded-xl mb-1 text-sm ${
                  selectedId === b.id ? "bg-red-100 border-2 border-red-400" : "hover:bg-gray-50"
                }`}
              >
                <div className="font-bold">{b.name}</div>
                <div className="text-xs text-gray-500">
                  {b.questionCount} questions · {b.userCount} user(s)
                </div>
              </button>
            ))}
          </div>

          <div className="border-2 border-gray-200 rounded-2xl p-3">
            <div className="text-sm font-bold mb-2">Create new bank</div>
            <div className="flex gap-2">
              <input
                value={creatingName}
                onChange={(e) => setCreatingName(e.target.value)}
                placeholder="Bank name"
                className="flex-1 p-2 border-2 border-gray-300 rounded-xl text-sm"
              />
              <button
                onClick={createBank}
                disabled={!creatingName.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition"
              >
                +
              </button>
            </div>
          </div>
        </aside>

        {/* Right: bank detail */}
        <section className="md:col-span-8">
          {!detail && (
            <div className="text-center text-gray-500 py-10 border-2 border-dashed border-gray-300 rounded-2xl">
              Select a bank to edit, or create a new one.
            </div>
          )}
          {detail && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  value={detail.name}
                  onChange={(e) => setDetail({ ...detail, name: e.target.value })}
                  onBlur={(e) => renameBank(e.target.value)}
                  className="flex-1 p-2 border-2 border-gray-300 rounded-xl font-bold"
                />
                {detail.name !== "Default" && (
                  <button
                    onClick={deleteBank}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition"
                  >
                    Delete bank
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Assigned to: {detail.users.length === 0 ? "no one" : detail.users.map((u) => u.username).join(", ")}
              </div>

              {/* Filter: subject + tier */}
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 text-sm">
                  <span className="font-bold">Subject:</span>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value as Subject)}
                    className="p-2 border-2 border-gray-300 rounded-xl text-sm"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <span className="font-bold">Tier:</span>
                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(Number(e.target.value) as Tier)}
                    className="p-2 border-2 border-gray-300 rounded-xl text-sm"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="ml-auto text-xs text-gray-500">
                  In this bank: {filteredBankQuestions.length}
                </span>
              </div>

              {/* In-bank list */}
              <div>
                <div className="text-sm font-bold mb-2">Questions in bank ({filterSubject}, T{filterTier})</div>
                {filteredBankQuestions.length === 0 ? (
                  <p className="text-sm text-gray-500">None at this filter.</p>
                ) : (
                  <ul className="space-y-2 max-h-72 overflow-auto">
                    {filteredBankQuestions.map((q) => (
                      <li
                        key={q.id}
                        className="border-2 border-gray-200 rounded-xl p-2 flex items-center gap-2"
                      >
                        <div className="flex-1 min-w-0 text-sm">
                          <div className="font-bold truncate">{q.prompt}</div>
                          <div className="text-xs text-gray-500">
                            {q.format} · ans: <span className="font-mono">{q.answer}</span> · {q.source}
                          </div>
                        </div>
                        <button
                          onClick={() => unlink(q.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg text-xs font-bold active:scale-95 transition"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add question UI */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-3">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold">Add question:</span>
                  <label className="text-sm flex items-center gap-1">
                    <input
                      type="radio"
                      checked={addMode === "existing"}
                      onChange={() => setAddMode("existing")}
                    />
                    Pick from master pool
                  </label>
                  <label className="text-sm flex items-center gap-1">
                    <input type="radio" checked={addMode === "new"} onChange={() => setAddMode("new")} />
                    Create new
                  </label>
                </div>

                {addMode === "existing" ? (
                  <div className="space-y-2">
                    <input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search prompts/answers (≥2 chars)"
                      className="w-full p-2 border-2 border-gray-300 rounded-xl text-sm"
                    />
                    <select
                      value={selectedExistingId}
                      onChange={(e) => setSelectedExistingId(e.target.value)}
                      size={6}
                      className="w-full p-2 border-2 border-gray-300 rounded-xl text-sm font-mono"
                    >
                      <option value="">— pick a question —</option>
                      {masterChoices.map((q) => (
                        <option key={q.id} value={q.id}>
                          [{q.format}] {q.prompt} → {q.answer}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addExisting}
                      disabled={!selectedExistingId}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition"
                    >
                      + Add to bank
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold">Format</span>
                      <select
                        value={newFormat}
                        onChange={(e) => setNewFormat(e.target.value as QuestionFormat)}
                        className="p-2 border-2 border-gray-300 rounded-xl text-sm"
                      >
                        <option value="multiple_choice">Multiple choice</option>
                        <option value="number_pad">Number pad</option>
                        <option value="text_pad">Text pad (A-Z)</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold">Skill</span>
                      <input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="p-2 border-2 border-gray-300 rounded-xl text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-xs font-bold">Prompt</span>
                      <input
                        value={newPrompt}
                        onChange={(e) => setNewPrompt(e.target.value)}
                        className="p-2 border-2 border-gray-300 rounded-xl text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-bold">Answer</span>
                      <input
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        className="p-2 border-2 border-gray-300 rounded-xl text-sm"
                      />
                    </label>
                    {newFormat === "multiple_choice" && (
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold">Choices (comma)</span>
                        <input
                          value={newChoices}
                          onChange={(e) => setNewChoices(e.target.value)}
                          className="p-2 border-2 border-gray-300 rounded-xl text-sm"
                        />
                      </label>
                    )}
                    <button
                      onClick={addCustom}
                      className="sm:col-span-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition"
                    >
                      + Create &amp; add to bank
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {error && <p className="text-red-500 text-sm font-bold mt-3">{error}</p>}
    </div>
  );
}
