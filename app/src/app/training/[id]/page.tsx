"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getPokemon } from "@/lib/pokemon";
import {
  bankIsEmpty,
  pickQuestion,
  recordAnswer,
  type Question,
} from "@/lib/questions";
import { subjectFor } from "@/lib/subjects";
import { loadCurrentProfile, saveProfile, type Profile } from "@/lib/storage";
import { playEvolve } from "@/lib/audio";
import QuestionModal from "@/components/QuestionModal";

const LEVEL_CAP = 100;
// Event multiplier: set both to 1 to restore default (+1 per correct answer).
const LEVEL_GAIN_MIN = 3;
const LEVEL_GAIN_MAX = 9;

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
    (async () => {
      const p = await loadCurrentProfile();
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
      setQuestion(pickQuestion(subjectFor(sp.id), sp.tier, p.history));
      setQSerial((s) => s + 1);
    })();
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
    setQuestion(pickQuestion(subjectFor(sp.id), sp.tier, p.history));
    setQSerial((s) => s + 1);
  }

  async function handleAnswer(correct: boolean) {
    if (!profile || !question) return;
    const p: Profile = {
      ...profile,
      history: recordAnswer(profile.history, question.id, correct),
      stats: { ...profile.stats, totalAnswered: profile.stats.totalAnswered + 1 },
      owned: { ...profile.owned },
      caught: [...profile.caught],
      evolved: [...profile.evolved],
    };
    if (!correct) {
      p.stats.currentStreak = 0;
      setProfile(p);
      pushFloat("Try again!", "text-red-500");
      nextQuestion(p, speciesId);
      await saveProfile(p);
      return;
    }
    p.stats.correct += 1;
    p.stats.currentStreak += 1;
    p.stats.longestStreak = Math.max(p.stats.longestStreak, p.stats.currentStreak);

    const ownedNow = p.owned[speciesId];
    let level = ownedNow.level;
    const gain = Math.floor(Math.random() * (LEVEL_GAIN_MAX - LEVEL_GAIN_MIN + 1)) + LEVEL_GAIN_MIN;
    if (level < LEVEL_CAP) level = Math.min(LEVEL_CAP, level + gain);

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
    setProfile(p);

    pushFloat(`+${gain} Levels!`, "text-yellow-500");

    if (didEvolve) {
      setEvolving(true);
      playEvolve();
      await saveProfile(p);
      setTimeout(() => {
        setEvolving(false);
        setEvolveMessage("");
        // Route to the evolved form's training page so the kid keeps going.
        router.replace(`/training/${evolvedToId}`);
      }, 2400);
    } else {
      nextQuestion(p, speciesId);
      await saveProfile(p);
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
          key={qSerial}
          question={question}
          onAnswer={handleAnswer}
          onExit={() => router.replace("/pokedex")}
          exitLabel="← Stop training"
        />
      )}

      {!evolving && !question && bankIsEmpty() && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm text-center">
            <p className="text-2xl font-extrabold text-yellow-600 mb-2">🧓 Ask Professor Oak!</p>
            <p className="text-gray-600">
              Your question bank doesn&apos;t have any questions yet.
            </p>
            <button
              onClick={() => router.replace("/pokedex")}
              className="mt-4 bg-yellow-300 hover:bg-yellow-400 px-5 py-3 rounded-2xl font-bold active:scale-95 transition"
            >
              ← Back to Pokedex
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
