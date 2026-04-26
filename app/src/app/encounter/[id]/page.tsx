"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getPokemon } from "@/lib/pokemon";
import {
  pickQuestion,
  recordAnswer,
  type Question,
} from "@/lib/questions";
import { subjectFor, getSubject } from "@/lib/subjects";
import { loadCurrentProfile, saveProfile, type Profile } from "@/lib/storage";
import { playCatch } from "@/lib/audio";
import QuestionModal from "@/components/QuestionModal";

type Phase = "intro" | "question" | "caught" | "fled";

export default function EncounterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pokemonId = Number(id);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [attempt, setAttempt] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const p = loadCurrentProfile();
    if (!p) {
      router.replace("/login");
      return;
    }
    const pkmn = getPokemon(pokemonId);
    // Evolution-only species (Ivysaur, Charmeleon, …) cannot appear in the
    // wild — only via evolution. Bounce the player back to the Pokedex.
    if (pkmn.evolution_only) {
      router.replace("/pokedex");
      return;
    }
    if (p.caught.includes(pokemonId)) {
      router.replace(`/training/${pokemonId}`);
      return;
    }
    setProfile(p);
    const t = setTimeout(() => {
      const subject = subjectFor(pkmn.id);
      const q = pickQuestion(p.age, subject, pkmn.tier, p.history);
      setQuestion(q);
      setPhase("question");
    }, 1100);
    return () => clearTimeout(t);
  }, [router, pokemonId]);

  if (!profile) return null;
  const pokemon = getPokemon(pokemonId);

  function handleAnswer(correct: boolean) {
    const p = loadCurrentProfile();
    if (!p || !question) return;
    p.history = recordAnswer(p.history, question.id, correct);
    p.stats.totalAnswered += 1;
    if (correct) {
      p.stats.correct += 1;
      p.stats.currentStreak += 1;
      p.stats.longestStreak = Math.max(p.stats.longestStreak, p.stats.currentStreak);
      p.caught = Array.from(new Set([...p.caught, pokemonId]));
      p.owned[pokemonId] = { level: 5, evolved: false };
      saveProfile(p);
      setProfile(p);
      setPhase("caught");
      playCatch();
      setTimeout(() => router.replace("/pokedex"), 2200);
    } else {
      p.stats.currentStreak = 0;
      saveProfile(p);
      setProfile(p);
      if (attempt >= 3) {
        setPhase("fled");
        setTimeout(() => router.replace("/pokedex"), 1800);
      } else {
        setAttempt(attempt + 1);
        const nextQ = pickQuestion(p.age, subjectFor(pokemon.id), pokemon.tier, p.history);
        setQuestion(nextQ);
      }
    }
  }

  return (
    <main className="flex flex-col flex-1 items-center justify-center p-6 relative overflow-hidden">
      <button
        onClick={() => router.replace("/pokedex")}
        className="absolute top-4 left-4 bg-white/80 hover:bg-white px-3 py-2 rounded-2xl font-bold active:scale-95 transition"
      >
        ← Back
      </button>

      <div className="text-center">
        <p className="text-2xl font-extrabold text-red-500 mb-2 animate-bounce-in">
          A wild {pokemon.name} appeared!
        </p>
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className={`w-64 h-64 object-contain animate-bounce-in ${
              phase === "caught" ? "scale-110" : ""
            }`}
          />
          {phase === "caught" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-7xl animate-pulse-ring">🎉</div>
            </div>
          )}
        </div>
        <p className="text-gray-700 mt-2">
          Pokeball <strong>{attempt}</strong> of 3
        </p>
        <div className="flex justify-center gap-2 mt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full border-2 ${
                i <= attempt ? "bg-red-400 border-red-600" : "bg-gray-100 border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {phase === "question" && question && (() => {
        const sub = getSubject(subjectFor(pokemon.id));
        const prefix = sub && sub.id !== "math" ? `${sub.label} — ` : "";
        return (
          <QuestionModal
            question={question}
            onAnswer={handleAnswer}
            subtitle={`${prefix}Throw ${attempt} of 3 — answer to catch ${pokemon.name}!`}
            onExit={() => router.replace("/pokedex")}
            exitLabel="← Run away"
          />
        );
      })()}

      {phase === "caught" && (
        <div className="mt-6 text-center">
          <p className="text-3xl font-extrabold text-green-500 animate-bounce-in">
            Gotcha! {pokemon.name} was caught!
          </p>
        </div>
      )}

      {phase === "fled" && (
        <div className="mt-6 text-center">
          <p className="text-3xl font-extrabold text-gray-500 animate-bounce-in">
            {pokemon.name} got away…
          </p>
          <p className="text-gray-600 mt-1">Try again from the Pokedex.</p>
        </div>
      )}
    </main>
  );
}
