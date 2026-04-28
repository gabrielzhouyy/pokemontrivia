"use client";
import { useEffect, useState } from "react";

type UserSummary = {
  id: number;
  username: string;
  bankId: number | null;
  caughtCount: number;
  evolvedCount: number;
  totalAnswered: number;
  correct: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: number;
};

type BankOption = { id: number; name: string };

export default function UsersTab() {
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  async function refresh() {
    setError("");
    const [usersRes, banksRes] = await Promise.all([
      fetch("/api/admin/users", { cache: "no-store" }),
      fetch("/api/admin/banks", { cache: "no-store" }),
    ]);
    if (!usersRes.ok) {
      setError("Failed to load players");
      setUsers([]);
      return;
    }
    const usersJ = (await usersRes.json()) as { users: UserSummary[] };
    setUsers(usersJ.users);
    if (banksRes.ok) {
      const banksJ = (await banksRes.json()) as { banks: BankOption[] };
      setBanks(banksJ.banks);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function setBank(user: UserSummary, bankId: number | null) {
    setBusy(user.id);
    const res = await fetch(`/api/admin/users/${user.id}/bank`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankId }),
    });
    setBusy(null);
    if (res.ok) refresh();
    else setError("Failed to assign bank");
  }

  async function reset(user: UserSummary) {
    if (!confirm(`Wipe ${user.username}'s progress? Their age stays the same.`)) return;
    setBusy(user.id);
    const res = await fetch(`/api/admin/users/${user.id}/reset`, { method: "POST" });
    setBusy(null);
    if (res.ok) refresh();
    else setError("Failed to reset progress");
  }

  async function del(user: UserSummary) {
    if (
      !confirm(
        `Delete ${user.username} permanently? All their progress (caught, evolved, history) is wiped. This cannot be undone.`,
      )
    )
      return;
    setBusy(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) refresh();
    else setError("Failed to delete user");
  }

  if (users === null) {
    return <div className="text-center text-gray-500 py-10">Loading players…</div>;
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>No player profiles yet.</p>
        <p className="text-sm mt-1">Have a kid sign in via the main login page first.</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold mb-3">Players</h2>
      {error && <p className="text-red-500 mb-3 font-bold">{error}</p>}
      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="border-2 border-gray-200 rounded-2xl p-4 flex flex-wrap items-center gap-4"
          >
            <div className="flex-1 min-w-[140px]">
              <div className="font-bold text-lg">{u.username}</div>
              <div className="text-xs text-gray-500">
                {u.caughtCount} caught · {u.evolvedCount} evolved · {u.accuracy}% acc · streak{" "}
                {u.currentStreak}
              </div>
            </div>
            <label className="flex items-center gap-2">
              <span className="text-sm font-bold">Bank</span>
              <select
                value={u.bankId ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (v !== u.bankId) setBank(u, v);
                }}
                disabled={busy === u.id}
                className="p-2 border-2 border-gray-300 rounded-xl text-sm disabled:opacity-50"
              >
                <option value="">— none —</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => reset(u)}
              disabled={busy === u.id}
              className="bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
            >
              Reset progress
            </button>
            <button
              onClick={() => del(u)}
              disabled={busy === u.id}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
