"use client";
import { useEffect, useState } from "react";
import {
  DEFAULT_AGE,
  listAllProfiles,
  loadProfile,
  resetProfile,
  saveProfile,
  type Profile,
} from "@/lib/storage";

export default function UsersTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  function refresh() {
    setProfiles(listAllProfiles());
  }

  useEffect(refresh, []);

  function setAge(username: string, age: number) {
    const p = loadProfile(username);
    if (!p) return;
    p.age = age;
    saveProfile(p);
    refresh();
  }

  function reset(username: string) {
    if (!confirm(`Wipe ${username}'s progress? Their age stays the same.`)) return;
    resetProfile(username);
    refresh();
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>No player profiles yet.</p>
        <p className="text-sm mt-1">Have a kid sign in via the main login page first.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold mb-3">Players on this device</h2>
      <p className="text-sm text-gray-600 mb-4">
        Set each kid&apos;s age to control which question bank they get. Default is age {DEFAULT_AGE}.
      </p>

      <div className="space-y-3">
        {profiles.map((p) => {
          const accuracy = p.stats.totalAnswered
            ? Math.round((p.stats.correct / p.stats.totalAnswered) * 100)
            : 0;
          return (
            <div
              key={p.username}
              className="border-2 border-gray-200 rounded-2xl p-4 flex flex-wrap items-center gap-4"
            >
              <div className="flex-1 min-w-[140px]">
                <div className="font-bold text-lg">{p.username}</div>
                <div className="text-xs text-gray-500">
                  {p.caught.length} caught · {p.evolved.length} evolved · {accuracy}% acc · streak{" "}
                  {p.stats.currentStreak}
                </div>
              </div>
              <label className="flex items-center gap-2">
                <span className="text-sm font-bold">Age</span>
                <input
                  type="number"
                  min={3}
                  max={18}
                  value={p.age}
                  onChange={(e) => setAge(p.username, Number(e.target.value) || DEFAULT_AGE)}
                  className="w-16 p-2 border-2 border-gray-300 rounded-xl text-center"
                />
              </label>
              <button
                onClick={() => reset(p.username)}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
              >
                Reset progress
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
