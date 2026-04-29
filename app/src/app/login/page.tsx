"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginOrRegister } from "@/lib/storage";
import { playClick, playWrong } from "@/lib/audio";

const COLORS = [
  { name: "red",    hex: "#ef4444" },
  { name: "blue",   hex: "#3b82f6" },
  { name: "green",  hex: "#22c55e" },
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

  async function submit() {
    const u = username.trim();
    if (!u) return setError("Type your name first!");
    setBusy(true);
    try {
      const profile = await loginOrRegister(u, color, priLevel);
      if (!profile) {
        playWrong();
        setShaking(true);
        setError("Name already taken! Pick a different colour.");
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
      <div className={`w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 ${shaking ? "animate-shake" : ""}`}>
        <h1 className="text-3xl font-extrabold text-center mb-2">
          Pokemon Trivia: Catch <span className="text-red-500">THREE</span> Pokemon and win a sticker!
        </h1>
        <p className="text-center text-gray-600 mb-4">Who&apos;s playing?</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            disabled
            className="bg-red-100 border-2 border-red-400 rounded-2xl py-3 px-2 flex flex-col items-center cursor-default"
          >
            <span className="text-3xl">🧒</span>
            <span className="font-extrabold text-sm mt-1">Player</span>
          </button>
          <Link
            href="/admin/login"
            className="bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-300 rounded-2xl py-3 px-2 flex flex-col items-center active:scale-95 transition"
          >
            <span className="text-3xl">🧓</span>
            <span className="font-extrabold text-sm mt-1">Professor Oak</span>
          </Link>
        </div>

        <label className="block text-sm font-bold mb-1">Trainer name</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className="w-full text-lg p-3 border-2 border-gray-300 rounded-2xl focus:border-red-400 outline-none mb-4"
          placeholder="e.g. Ash"
          autoFocus
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
            >
              {c.name}
            </button>
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
    </main>
  );
}
