"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { POKEMON } from "@/lib/pokemon";
import { loadCurrentProfile, type Profile, logout } from "@/lib/storage";
import { isMuted, setMuted, playClick } from "@/lib/audio";

const TIER_COLOR: Record<number, string> = {
  1: "bg-green-100 border-green-300",
  2: "bg-blue-100 border-blue-300",
  3: "bg-purple-100 border-purple-300",
  4: "bg-pink-100 border-pink-400",
};

export default function PokedexPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [muteState, setMuteState] = useState(false);

  useEffect(() => {
    const p = loadCurrentProfile();
    if (!p) {
      router.replace("/login");
      return;
    }
    if (!p.starterId) {
      router.replace("/starter");
      return;
    }
    setProfile(p);
    setMuteState(isMuted());
  }, [router]);

  if (!profile) return <div className="flex flex-1 items-center justify-center">Loading…</div>;

  const caughtCount = profile.caught.length;
  const evolvedCount = profile.evolved.length;
  const totalEvolvable = POKEMON.filter((p) => p.evolves_to !== null).length;

  return (
    <main className="flex flex-col flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            <span className="text-red-500">Poké</span>dex
          </h1>
          <p className="text-sm text-gray-600">Trainer: <span className="font-bold">{profile.username}</span></p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/stats"
            className="bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
          >
            🏆 Stats
          </Link>
          <button
            onClick={() => {
              const next = !muteState;
              setMuted(next);
              setMuteState(next);
              if (!next) playClick();
            }}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
            aria-label={muteState ? "Unmute" : "Mute"}
          >
            {muteState ? "🔇" : "🔊"}
          </button>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
          >
            ⎋
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow p-4 mb-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-3xl font-extrabold text-red-500">{caughtCount}</div>
          <div className="text-xs text-gray-500">caught of 151</div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-yellow-500">{evolvedCount}</div>
          <div className="text-xs text-gray-500">evolved of {totalEvolvable}</div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-green-500">
            {profile.stats.totalAnswered > 0
              ? Math.round((profile.stats.correct / profile.stats.totalAnswered) * 100)
              : 0}
            %
          </div>
          <div className="text-xs text-gray-500">accuracy</div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-3 pb-8">
        {POKEMON.map((p, idx) => {
          const caught = profile.caught.includes(p.id);
          const owned = profile.owned[p.id];
          const currentSpriteId = owned?.speciesId ?? p.id;
          const tierClass = TIER_COLOR[p.tier];
          const href = caught ? `/training/${p.id}` : `/encounter/${p.id}`;
          return (
            <Link
              href={href}
              key={p.id}
              className={`flex flex-col items-center p-2 rounded-2xl border-2 ${tierClass} hover:scale-105 active:scale-95 transition`}
            >
              <div className="relative w-full aspect-square flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentSpriteId}.png`}
                  alt={caught ? p.name : "???"}
                  className={`w-full h-full object-contain image-pixelated ${
                    caught ? "" : "brightness-0 opacity-40"
                  }`}
                  loading={idx < 60 ? "eager" : "lazy"}
                  decoding="async"
                />
                {caught && (
                  <span className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                #{String(p.id).padStart(3, "0")}
              </div>
              <div className="text-xs font-bold text-center leading-tight truncate w-full">
                {caught ? p.name : "???"}
              </div>
              {owned && (
                <div className="text-[10px] text-gray-500">L{owned.level}</div>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
