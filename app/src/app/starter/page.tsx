"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPokemon, STARTERS } from "@/lib/pokemon";
import { loadCurrentProfile, saveProfile } from "@/lib/storage";
import { playCatch, playClick } from "@/lib/audio";

export default function StarterPage() {
  const router = useRouter();
  const [chosen, setChosen] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await loadCurrentProfile();
      if (!p) router.replace("/login");
      else if (p.starterId) router.replace("/pokedex");
    })();
  }, [router]);

  function pick(id: number) {
    playClick();
    setChosen(id);
  }

  async function confirm() {
    if (chosen === null) return;
    const p = await loadCurrentProfile();
    if (!p) return;
    p.starterId = chosen;
    p.caught = [chosen];
    p.owned[chosen] = { level: 5, evolved: false };
    await saveProfile(p);
    setConfirming(true);
    playCatch();
    setTimeout(() => router.replace("/pokedex"), 1600);
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-center mb-2">Pick your Pokemon!</h1>
        <p className="text-center text-gray-600 mb-6">
          This is your first partner. Tap to choose.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STARTERS.map((id) => {
            const p = getPokemon(id);
            const selected = chosen === id;
            return (
              <button
                key={id}
                onClick={() => pick(id)}
                disabled={confirming}
                className={`flex flex-col items-center p-4 rounded-2xl border-4 transition active:scale-95 ${
                  selected
                    ? "border-red-400 bg-yellow-50 scale-105"
                    : "border-gray-200 bg-gray-50 hover:border-yellow-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.sprite} alt={p.name} className="w-32 h-32 object-contain" />
                <div className="font-bold text-lg mt-2">{p.name}</div>
                <div className="text-xs text-gray-500">#{String(p.id).padStart(3, "0")}</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={confirm}
          disabled={chosen === null || confirming}
          className="w-full mt-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-xl active:scale-95 transition"
        >
          {confirming ? "Caught!" : chosen ? `Choose ${getPokemon(chosen).name}!` : "Pick one"}
        </button>
      </div>
    </main>
  );
}
