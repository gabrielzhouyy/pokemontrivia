"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginOrRegister, quickStart } from "@/lib/storage";
import { playClick, playWrong } from "@/lib/audio";

const COLORS = [
  { name: "red",    hex: "#ef4444" },
  { name: "green",  hex: "#22c55e" },
  { name: "blue",   hex: "#3b82f6" },
  { name: "yellow", hex: "#eab308" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [color, setColor] = useState("red");
  const [priLevel, setPriLevel] = useState<number>(1);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [quickBusy, setQuickBusy] = useState(false);

  async function handleQuickStart() {
    setQuickBusy(true);
    try {
      const profile = await quickStart();
      if (!profile) {
        playWrong();
        return;
      }
      router.replace("/pokedex");
    } finally {
      setQuickBusy(false);
    }
  }

  async function submit() {
    const u = username.trim();
    if (!u) return setError("Type your name first!");
    setBusy(true);
    try {
      const profile = await loginOrRegister(u, color, priLevel);
      if (!profile) {
        playWrong();
        setShaking(true);
        setError("Name already taken! Pick a different name.");
        setTimeout(() => setShaking(false), 400);
        return;
      }
      router.replace(profile.starterId ? "/pokedex" : "/starter");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold text-center">
          Poké-Go <span className="text-red-500">Singapore</span>
        </h1>

        {/* Primary: Quick Start */}
        <button
          onClick={handleQuickStart}
          disabled={quickBusy}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-white rounded-3xl py-6 text-2xl font-extrabold active:scale-95 transition shadow-lg flex flex-col items-center gap-1"
        >
          {quickBusy ? "…" : (
            <>
              <span>Quick Start</span>
              <span className="text-base font-bold opacity-90">Play as Ash with Pikachu!</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-gray-200" />
          <span>or sign in as a custom trainer</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Secondary: Custom login */}
        <div className={`bg-white rounded-3xl shadow p-6 ${shaking ? "animate-shake" : ""}`}>
          <p className="text-center text-gray-500 text-sm font-bold mb-4">Who&apos;s playing?</p>

          <label className="block text-sm font-bold mb-1">Trainer name</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            className="w-full text-lg p-3 border-2 border-gray-300 rounded-2xl focus:border-red-400 outline-none mb-4"
            placeholder="e.g. Misty"
          />

          <label className="block text-sm font-bold mb-1">Difficulty</label>
          <select
            value={priLevel}
            onChange={(e) => setPriLevel(Number(e.target.value))}
            className="w-full text-lg p-3 border-2 border-gray-300 rounded-2xl focus:border-red-400 outline-none mb-4"
          >
            <option value={1}>Easy (PreK – K)</option>
            <option value={2}>Medium (Grade 1–3)</option>
            <option value={3}>Hard (Grade 4–5)</option>
            <option value={4}>Very Hard (Adult)</option>
          </select>

          <label className="block text-sm font-bold mb-2">Pick your colour</label>
          <div className="grid grid-cols-2 gap-3 my-3">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => { setColor(c.name); playClick(); setError(""); }}
                className={`w-full py-5 rounded-2xl font-extrabold text-white text-lg capitalize transition active:scale-95 ${
                  color === c.name
                    ? "ring-4 ring-offset-2 ring-gray-400 scale-105"
                    : "hover:scale-105 opacity-70"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-2xl py-4 text-xl font-bold active:scale-95 transition"
          >
            {busy ? "…" : "Let's go!"}
          </button>

          {error && <p className="text-red-500 text-center mt-4 font-bold">{error}</p>}
        </div>

        {/* Admin link */}
        <div className="text-center">
          <Link
            href="/admin/login"
            className="text-sm text-gray-400 hover:text-gray-600 underline transition"
          >
            Professor Oak (Admin)
          </Link>
        </div>
      </div>
    </main>
  );
}
