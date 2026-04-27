"use client";
import { useEffect, useState } from "react";
import { DEFAULT_AGE } from "@/lib/profile-types";

type UserSummary = {
  id: number;
  username: string;
  age: number;
  caughtCount: number;
  evolvedCount: number;
  totalAnswered: number;
  correct: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: number;
};

export default function UsersTab() {
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  async function refresh() {
    setError("");
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (!res.ok) {
      setError("Failed to load players");
      setUsers([]);
      return;
    }
    const j = (await res.json()) as { users: UserSummary[] };
    setUsers(j.users);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function setAge(user: UserSummary, age: number) {
    setBusy(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age }),
    });
    setBusy(null);
    if (res.ok) refresh();
    else setError("Failed to set age");
  }

  async function reset(user: UserSummary) {
    if (!confirm(`Wipe ${user.username}'s progress? Their age stays the same.`)) return;
    setBusy(user.id);
    const res = await fetch(`/api/admin/users/${user.id}/reset`, { method: "POST" });
    setBusy(null);
    if (res.ok) refresh();
    else setError("Failed to reset progress");
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
      <h2 className="text-xl font-extrabold mb-3">Players (server)</h2>
      <p className="text-sm text-gray-600 mb-4">
        Set each kid&apos;s age to control which question bank they get. Default is age {DEFAULT_AGE}.
      </p>
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
              <span className="text-sm font-bold">Age</span>
              <input
                type="number"
                min={3}
                max={18}
                defaultValue={u.age}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (v && v !== u.age) setAge(u, v);
                }}
                disabled={busy === u.id}
                className="w-16 p-2 border-2 border-gray-300 rounded-xl text-center disabled:opacity-50"
              />
            </label>
            <button
              onClick={() => reset(u)}
              disabled={busy === u.id}
              className="bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
            >
              Reset progress
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
