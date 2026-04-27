"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { POKEMON } from "@/lib/pokemon";
import { loadCurrentProfile, type Profile } from "@/lib/storage";

type Badge = {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
};

export default function StatsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const p = await loadCurrentProfile();
      if (!p) router.replace("/login");
      else setProfile(p);
    })();
  }, [router]);

  if (!profile) return null;

  const evolvable = POKEMON.filter((p) => p.evolves_to !== null).length;
  const accuracy = profile.stats.totalAnswered
    ? Math.round((profile.stats.correct / profile.stats.totalAnswered) * 100)
    : 0;

  const badges: Badge[] = [
    { id: "first", label: "First catch", emoji: "🎉", earned: profile.caught.length >= 1 },
    { id: "ten", label: "10 caught", emoji: "🔟", earned: profile.caught.length >= 10 },
    { id: "fifty", label: "50 caught", emoji: "🥈", earned: profile.caught.length >= 50 },
    { id: "hundred", label: "100 caught", emoji: "🥇", earned: profile.caught.length >= 100 },
    { id: "all", label: "Catch 'em all (151)", emoji: "🏆", earned: profile.caught.length >= 151 },
    { id: "evolve1", label: "First evolution", emoji: "✨", earned: profile.evolved.length >= 1 },
    {
      id: "evolveAll",
      label: "Evolve all",
      emoji: "🌟",
      earned: profile.evolved.length >= evolvable,
    },
    { id: "streak10", label: "10 in a row", emoji: "🔥", earned: profile.stats.longestStreak >= 10 },
    { id: "streak50", label: "50 in a row", emoji: "💥", earned: profile.stats.longestStreak >= 50 },
  ];

  return (
    <main className="flex flex-col flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold">🏆 Stats</h1>
        <Link
          href="/pokedex"
          className="bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
        >
          ← Pokedex
        </Link>
      </header>

      <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
        <Stat label="Caught" value={`${profile.caught.length} / 151`} color="text-red-500" />
        <Stat label="Evolved" value={`${profile.evolved.length} / ${evolvable}`} color="text-yellow-500" />
        <Stat label="Answered" value={String(profile.stats.totalAnswered)} color="text-blue-500" />
        <Stat label="Accuracy" value={`${accuracy}%`} color="text-green-500" />
        <Stat label="Streak" value={String(profile.stats.currentStreak)} color="text-purple-500" />
        <Stat label="Best streak" value={String(profile.stats.longestStreak)} color="text-pink-500" />
        <Stat label="Correct" value={String(profile.stats.correct)} color="text-green-700" />
        <Stat
          label="Days playing"
          value={String(Math.max(1, Math.ceil((Date.now() - profile.createdAt) / 86400000)))}
          color="text-gray-700"
        />
      </div>

      <h2 className="text-xl font-extrabold mb-3">Badges</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
              b.earned ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200 opacity-50"
            }`}
          >
            <div className="text-3xl">{b.emoji}</div>
            <div className="font-bold text-sm">{b.label}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
