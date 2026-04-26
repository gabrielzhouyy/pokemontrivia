"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getPokemon } from "@/lib/pokemon";
import {
  pickQuestion,
  recordAnswer,
  type Question,
} from "@/lib/questions";
import { loadCurrentProfile, saveProfile, type Profile } from "@/lib/storage";
import { playEvolve } from "@/lib/audio";
import QuestionModal from "@/components/QuestionModal";

const LEVEL_CAP = 100;

export default function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const baseId = Number(id);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [floats, setFloats] = useState<{ key: number; text: string; cls: string }[]>([]);
  const [evolving, setEvolving] = useState(false);
  const [evolveMessage, setEvolveMessage] = useState("");

  useEffect(() => {
    const p = loadCurrentProfile();
    if (!p) {
      router.replace("/login");
      return;
    }
    if (!p.caught.includes(baseId)) {
      router.replace(`/encounter/${baseId}`);
      return;
    }
    setProfile(p);
    const owned = p.owned[baseId];
    const tier = getPokemon(owned.speciesId).tier;
    setQuestion(pickQuestion(tier, p.history));
  }, [router, baseId]);

  if (!profile) return null;
  const owned = profile.owned[baseId];
  if (!owned) return null;
  const current = getPokemon(owned.speciesId);
  const base = getPokemon(baseId);

  function pushFloat(text: string, cls: string) {
    const key = Date.now() + Math.random();
    setFloats((f) => [...f, { key, text, cls }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 1000);
  }

  function nextQuestion(p: Profile) {
    const tier = getPokemon(p.owned[baseId].speciesId).tier;
    setQuestion(pickQuestion(tier, p.history));
  }

  function handleAnswer(correct: boolean) {
    const p = loadCurrentProfile();
    if (!p || !question) return;
    p.history = recordAnswer(p.history, question.id, correct);
    p.stats.totalAnswered += 1;
    if (!correct) {
      p.stats.currentStreak = 0;
      saveProfile(p);
      setProfile(p);
      pushFloat("Try again!", "text-red-500");
      nextQuestion(p);
      return;
    }
    p.stats.correct += 1;
    p.stats.currentStreak += 1;
    p.stats.longestStreak = Math.max(p.stats.longestStreak, p.stats.currentStreak);

    const ownedNow = p.owned[baseId];
    let level = ownedNow.level;
    if (level < LEVEL_CAP) level += 1;
    let speciesId = ownedNow.speciesId;
    const cur = getPokemon(speciesId);
    const evolvesAt = cur.evolve_level;
    let didEvolve = false;
    if (cur.evolves_to !== null && evolvesAt !== null && level >= evolvesAt) {
      const evolvedTo = getPokemon(cur.evolves_to);
      speciesId = evolvedTo.id;
      p.evolved = Array.from(new Set([...p.evolved, baseId]));
      didEvolve = true;
      setEvolveMessage(`${cur.name} evolved into ${evolvedTo.name}!`);
    }
    p.owned[baseId] = { id: ownedNow.id, level, speciesId };
    saveProfile(p);
    setProfile(p);

    pushFloat("+1 Level!", "text-yellow-500");

    if (didEvolve) {
      setEvolving(true);
      playEvolve();
      setTimeout(() => {
        setEvolving(false);
        setEvolveMessage("");
        nextQuestion(p);
      }, 2400);
    } else {
      nextQuestion(p);
    }
  }

  return (
    <main className="flex flex-col flex-1 items-center justify-center p-6 relative overflow-hidden">
      <button
        onClick={() => router.replace("/pokedex")}
        className="absolute top-4 left-4 bg-white/80 hover:bg-white px-3 py-2 rounded-2xl font-bold active:scale-95 transition z-10"
      >
        ← Back
      </button>

      <div className="text-center">
        <p className="text-xl font-extrabold text-blue-500 mb-2">
          Training {current.name}!
        </p>
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.sprite}
            alt={current.name}
            className={`w-56 h-56 object-contain ${evolving ? "animate-evolve" : "animate-bounce-in"}`}
          />
          <div className="absolute -top-4 right-0 pointer-events-none">
            {floats.map((f) => (
              <div key={f.key} className={`absolute right-0 text-xl font-extrabold animate-float-up ${f.cls}`}>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <p className="font-bold">{current.name} <span className="text-gray-500 text-sm">L{owned.level}</span></p>
          <div className="w-64 h-3 bg-gray-200 rounded-full mt-1 overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-red-400 transition-all"
              style={{ width: `${owned.level}%` }}
            />
          </div>
          {current.evolve_level && current.evolves_to && (
            <p className="text-xs text-gray-500 mt-1">
              Evolves at L{current.evolve_level}
            </p>
          )}
        </div>
      </div>

      {evolving && (
        <div className="fixed inset-0 bg-yellow-100/70 flex items-center justify-center z-40 pointer-events-none">
          <p className="text-3xl font-extrabold text-yellow-700 animate-bounce-in text-center">
            {evolveMessage}
          </p>
        </div>
      )}

      {!evolving && question && (
        <QuestionModal
          question={question}
          onAnswer={handleAnswer}
          subtitle={`Train ${current.name} L${owned.level} — answer to level up!`}
          onExit={() => router.replace("/pokedex")}
          exitLabel="← Stop training"
        />
      )}
    </main>
  );
}
