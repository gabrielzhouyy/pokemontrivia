"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadProfile, newProfile, saveProfile } from "@/lib/storage";
import { playClick, playWrong } from "@/lib/audio";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  function pressDigit(d: string) {
    setError("");
    if (pin.length >= 4) return;
    playClick();
    setPin(pin + d);
  }
  function backspace() {
    playClick();
    setPin(pin.slice(0, -1));
    setError("");
  }
  function submit() {
    const u = username.trim();
    if (!u) {
      setError("Type your name first!");
      return;
    }
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    const existing = loadProfile(u);
    if (existing) {
      if (existing.pin !== pin) {
        playWrong();
        setShaking(true);
        setError("Wrong PIN, try again!");
        setPin("");
        setTimeout(() => setShaking(false), 400);
        return;
      }
      saveProfile(existing);
      if (!existing.starterId) router.replace("/starter");
      else router.replace("/pokedex");
    } else {
      const p = newProfile(u, pin);
      saveProfile(p);
      router.replace("/starter");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className={`w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 ${shaking ? "animate-shake" : ""}`}>
        <h1 className="text-3xl font-extrabold text-center mb-2">
          Pokemon <span className="text-red-500">Math</span> Catcher
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
          className="w-full text-lg p-3 border-2 border-gray-300 rounded-2xl focus:border-red-400 outline-none mb-4"
          placeholder="e.g. Ash"
          autoFocus
        />

        <label className="block text-sm font-bold mb-1">4-digit PIN</label>
        <div className="flex justify-center gap-3 my-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-2xl border-2 ${
                pin.length > i ? "bg-red-400 border-red-500" : "bg-gray-100 border-gray-300"
              } flex items-center justify-center text-2xl font-bold text-white`}
            >
              {pin.length > i ? "•" : ""}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => pressDigit(d)}
              className="bg-gray-100 hover:bg-yellow-200 active:scale-95 transition rounded-2xl py-4 text-2xl font-bold"
            >
              {d}
            </button>
          ))}
          <button
            onClick={backspace}
            className="bg-gray-200 hover:bg-gray-300 active:scale-95 transition rounded-2xl py-4 text-xl font-bold"
            aria-label="Backspace"
          >
            ⌫
          </button>
          <button
            onClick={() => pressDigit("0")}
            className="bg-gray-100 hover:bg-yellow-200 active:scale-95 transition rounded-2xl py-4 text-2xl font-bold"
          >
            0
          </button>
          <button
            onClick={submit}
            className="bg-green-500 hover:bg-green-600 text-white active:scale-95 transition rounded-2xl py-4 text-xl font-bold"
            aria-label="Submit"
          >
            ✓
          </button>
        </div>

        {error && <p className="text-red-500 text-center mt-4 font-bold">{error}</p>}
        <p className="text-xs text-gray-400 text-center mt-4">
          Your progress is saved on this device.
        </p>
      </div>
    </main>
  );
}
