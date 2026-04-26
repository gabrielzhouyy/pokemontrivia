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
import { playEvolve } from "@/lib/audio";
import QuestionModal from "@/components/QuestionModal";

const LEVEL_CAP = 100;

export default function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const speciesId = Number(id);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  // Increments on every new question presentation. Used as a key on the
  // QuestionModal so it remounts even when the same question is re-presented
  // (e.g. tiny bank where pickQuestion returns the same object) — otherwise
  // the modal stays locked on its previous feedback state.
  const [qSerial, setQSerial] = useState(0);
  const [floats, setFloats] = useState<{ key: number; text: string; cls: string }[]>([]);
  const [evolving, setEvolving] = useState(false);
  const [evolveMessage, setEvolveMessage] = useState("");

  useEffect(() => {
    const p = loadCurrentProfile();
    if (!p) {
      router.replace("/login");
      return;
    }
    const owned = p.owned[speciesId];
    // Not owned at all → bounce to encounter (or pokedex if evolution-only).
    if (!owned) {
      const sp = getPokemon(speciesId);
      router.replace(sp.evolution_only ? "/pokedex" : `/encounter/${speciesId}`);
      return;
    }
    // Owned but already evolved past — this slot is locked.
    if (owned.evolved) {
      router.replace("/pokedex");
      return;
    }
    setProfile(p);
    const sp = getPokemon(speciesId);
    setQuestion(pickQuestion(p.age, subjectFor(sp.id), sp.tier, p.history));
    setQSerial((s) => s + 1);
  }, [router, speciesId]);

  if (!profile) return null;
  const owned = profile.owned[speciesId];
  if (!owned) return null;
  const current = getPokemon(speciesId);

  function pushFloat(text: string, cls: string) {
    const key = Date.now() + Math.random();
    setFloats((f) => [...f, { key, text, cls }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 1000);
  }

  function nextQuestion(p: Profile, sid: number) {
    const sp = getPokemon(sid);
    setQuestion(pickQuestion(p.age, subjectFor(sp.id), sp.tier, p.history));
    setQSerial((s) => s + 1);
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
      nextQuestion(p, speciesId);
      return;
    }
    p.stats.correct += 1;
    p.stats.currentStreak += 1;
    p.stats.longestStreak = Math.max(p.stats.longestStreak, p.stats.currentStreak);

    const ownedNow = p.owned[speciesId];
    let level = ownedNow.level;
    if (level < LEVEL_CAP) level += 1;

    const cur = getPokemon(speciesId);
    const evolvesAt = cur.evolve_level;
    let didEvolve = false;
    let evolvedToId = speciesId;
    if (cur.evolves_to !== null && evolvesAt !== null && level >= evolvesAt) {
      const evolvedTo = getPokemon(cur.evolves_to);
      // Lock the current slot (frozen at evolve_level) and unlock the evolved
      // form as a new owned entry, auto-caught.
      p.owned[speciesId] = { level: evolvesAt, evolved: true };
      p.owned[evolvedTo.id] = { level: evolvesAt, evolved: false };
      p.caught = Array.from(new Set([...p.caught, evolvedTo.id]));
      p.evolved = Array.from(new Set([...p.evolved, speciesId]));
      didEvolve = true;
      evolvedToId = evolvedTo.id;
      setEvolveMessage(`${cur.name} evolved into ${evolvedTo.name}!`);
    } else {
      p.owned[speciesId] = { level, evolved: false };
    }
    saveProfile(p);
    setProfile(p);

    pushFloat("+1 Level!", "text-yellow-500");

    if (didEvolve) {
      setEvolving(true);
      playEvolve();
      setTimeout(() => {
        setEvolving(false);
        setEvolveMessage("");
        // Route to the evolved form's training page so the kid keeps going.
        router.replace(`/training/${evolvedToId}`);
      }, 2400);
    } else {
      nextQuestion(p, speciesId);
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

      {!evolving && question && (() => {
        const sub = getSubject(subjectFor(current.id));
        const prefix = sub && sub.id !== "math" ? `${sub.label} — ` : "";
        return (
          <QuestionModal
            key={qSerial}
            question={question}
            onAnswer={handleAnswer}
            subtitle={`${prefix}Train ${current.name} L${owned.level} — answer to level up!`}
            onExit={() => router.replace("/pokedex")}
            exitLabel="← Stop training"
          />
        );
      })()}
    </main>
  );
}
