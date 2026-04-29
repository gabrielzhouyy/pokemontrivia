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
    (async () => {
      const p = await loadCurrentProfile();
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
    })();
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
            Stats
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
            {muteState ? "Sound Off" : "Sound On"}
          </button>
          <button
            onClick={() => {
              (async () => {
                await logout();
                router.replace("/login");
              })();
            }}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-2xl font-bold active:scale-95 transition"
          >
            Change User
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

      <p className="text-sm text-gray-500 text-center mb-3">Level up Pokemon by clicking on them</p>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-3 pb-8">
        {POKEMON.map((p, idx) => {
          const caught = profile.caught.includes(p.id);
          const owned = profile.owned[p.id];
          const tierClass = TIER_COLOR[p.tier];

          // Three states for the cell:
          //   1. owned + active   → clickable, routes to /training/[id]
          //   2. owned + evolved  → locked, base sprite, ⛓ badge, NOT a link
          //   3. uncaught         → silhouette + "???". Evolution-only species
          //                         get an extra ✨ "evolve to unlock" hint.
          //   4. uncaught wild    → clickable, routes to /encounter/[id]
          const isOwnedActive = caught && owned && !owned.evolved;
          const isOwnedEvolved = caught && owned && owned.evolved;
          const isLockedEvolutionOnly = !caught && p.evolution_only;

          const cellClass = `flex flex-col items-center p-2 rounded-2xl border-2 ${tierClass} transition ${
            isOwnedEvolved || isLockedEvolutionOnly
              ? "opacity-90 cursor-not-allowed"
              : "hover:scale-105 active:scale-95"
          }`;

          const inner = (
            <>
              <div className="relative w-full aspect-square flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                  alt={caught ? p.name : "???"}
                  className={`w-full h-full object-contain image-pixelated ${
                    caught ? "" : "brightness-0 opacity-40"
                  }`}
                  loading={idx < 60 ? "eager" : "lazy"}
                  decoding="async"
                />
                {isOwnedActive && (
                  <span className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    ✓
                  </span>
                )}
                {isOwnedEvolved && (
                  <span
                    className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    title="Evolved past — locked"
                  >
                    ⛓
                  </span>
                )}
                {isLockedEvolutionOnly && (
                  <span
                    className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    title="Evolve the previous form to unlock"
                  >
                    ✨
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
                <div className="text-[10px] text-gray-500">
                  L{owned.level}
                  {owned.evolved && " ⛓"}
                </div>
              )}
              {isLockedEvolutionOnly && (
                <div className="text-[10px] text-yellow-600 font-bold leading-tight text-center">
                  {(() => {
                    const pre = POKEMON.find((x) => x.evolves_to === p.id);
                    return pre ? `Evolve ${pre.name}` : "evolve only";
                  })()}
                </div>
              )}
            </>
          );

          if (isOwnedEvolved || isLockedEvolutionOnly) {
            return (
              <div key={p.id} className={cellClass}>
                {inner}
              </div>
            );
          }
          const href = isOwnedActive ? `/training/${p.id}` : `/encounter/${p.id}`;
          return (
            <Link href={href} key={p.id} className={cellClass}>
              {inner}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
