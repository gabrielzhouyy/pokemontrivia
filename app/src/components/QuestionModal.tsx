"use client";
import { useEffect, useState } from "react";
import type { Question } from "@/lib/questions";
import { playCorrect, playWrong, playClick } from "@/lib/audio";

type Props = {
  question: Question;
  onAnswer: (correct: boolean) => void;
  // Optional Pokemon sprite shown in the modal header.
  imageUrl?: string;
  imageName?: string;
  // Optional info shown above the question (e.g. "Attempt 2 of 3")
  subtitle?: string;
  // Optional escape hatch — when set, the modal shows a "back" pill the player
  // can tap any time (except mid feedback-reveal) to leave the loop.
  onExit?: () => void;
  exitLabel?: string;
  levelUpText?: string;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// True if the string contains any CJK Unified Ideograph — used to bump the
// font size on multiple-choice buttons so Chinese characters are legible.
const CJK_RE = /[一-鿿]/;
function containsCJK(s: string): boolean {
  return CJK_RE.test(s);
}

function answersMatch(typed: string, answer: string): boolean {
  // Case-insensitive comparison for text_pad (English spelling).
  return typed.trim().toUpperCase() === answer.trim().toUpperCase();
}

export default function QuestionModal({ question, onAnswer, imageUrl, imageName, subtitle, onExit, exitLabel, levelUpText }: Props) {
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");
  const [locked, setLocked] = useState(false);

  // Reset state when a new question arrives.
  useEffect(() => {
    setTyped("");
    setFeedback("none");
    setLocked(false);
  }, [question.id]);

  function reveal(correct: boolean) {
    setLocked(true);
    setFeedback(correct ? "correct" : "wrong");
    if (correct) playCorrect();
    else playWrong();
  }

  function pickChoice(c: string) {
    if (locked) return;
    playClick();
    reveal(c === question.answer);
  }
  function numPad(d: string) {
    if (locked) return;
    playClick();
    if (d === "⌫") {
      setTyped(typed.slice(0, -1));
      return;
    }
    // Only one decimal point allowed.
    if (d === "." && typed.includes(".")) return;
    if (typed.length < 6) setTyped(typed + d);
  }
  function submitNumPad() {
    if (locked || !typed) return;
    reveal(typed === question.answer);
  }
  function letterPad(letter: string) {
    if (locked) return;
    playClick();
    if (letter === "⌫") setTyped(typed.slice(0, -1));
    else if (typed.length < 16) setTyped(typed + letter);
  }
  function submitLetterPad() {
    if (locked || !typed) return;
    reveal(answersMatch(typed, question.answer));
  }

  // For multiple-choice, detect Chinese choices and bump font size.
  const choicesContainCJK =
    question.format === "multiple_choice" &&
    !!question.choices &&
    question.choices.some(containsCJK);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white rounded-3xl shadow-2xl p-4 w-full max-w-md ${
          feedback === "wrong" ? "animate-shake" : ""
        } ${feedback === "correct" ? "ring-4 ring-green-400" : ""}`}
      >
        {onExit && (
          <button
            onClick={onExit}
            disabled={locked}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm font-bold rounded-full px-3 py-1 active:scale-95 transition mb-2"
          >
            {exitLabel ?? "← Back to Pokedex"}
          </button>
        )}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={imageName ?? ""} className="w-16 h-16 object-contain mx-auto mb-1" />
        )}
        {subtitle && (
          <p className="text-center text-sm text-gray-500 font-bold mb-2">{subtitle}</p>
        )}
        <div className="text-base sm:text-lg font-extrabold text-center my-3 leading-snug">
          {question.prompt}
        </div>

        {question.format === "multiple_choice" && question.choices && (
          <div className="grid grid-cols-2 gap-3">
            {question.choices.map((c) => {
              const isAnswer = c === question.answer;
              const showResult = feedback !== "none";
              const cls = !showResult
                ? "bg-yellow-200 hover:bg-yellow-300"
                : isAnswer
                ? "bg-green-400 text-white"
                : "bg-gray-200 text-gray-500";
              const sizeCls = choicesContainCJK ? "text-2xl py-4" : "text-lg py-4";
              return (
                <button
                  key={c}
                  onClick={() => pickChoice(c)}
                  disabled={locked}
                  className={`${cls} ${sizeCls} rounded-2xl font-extrabold active:scale-95 transition`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {question.format === "number_pad" && (
          <>
            <div className="flex justify-center mb-3">
              <div className="bg-gray-100 rounded-2xl px-6 py-3 min-w-[120px] text-center text-3xl font-extrabold tracking-widest">
                {typed || <span className="text-gray-300">_</span>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((d) => {
                return (
                  <button
                    key={d}
                    onClick={() => numPad(d)}
                    disabled={locked}
                    className="bg-yellow-200 hover:bg-yellow-300 rounded-2xl py-4 text-2xl font-bold active:scale-95 transition"
                  >
                    {d}
                  </button>
                );
              })}
              <button
                key="submit"
                onClick={submitNumPad}
                disabled={locked || !typed}
                className="col-span-3 bg-green-500 disabled:bg-gray-300 text-white rounded-2xl py-3 text-xl font-bold active:scale-95 transition"
              >
                ✓
              </button>
            </div>
          </>
        )}

        {question.format === "text_pad" && (
          <>
            <div className="flex justify-center mb-3">
              <div className="bg-gray-100 rounded-2xl px-6 py-3 min-w-[160px] text-center text-3xl font-extrabold tracking-wider uppercase">
                {typed || <span className="text-gray-300">_</span>}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {ALPHABET.map((l) => (
                <button
                  key={l}
                  onClick={() => letterPad(l)}
                  disabled={locked}
                  className="bg-yellow-200 hover:bg-yellow-300 rounded-xl py-3 text-lg font-bold active:scale-95 transition"
                >
                  {l}
                </button>
              ))}
              <button
                onClick={() => letterPad("⌫")}
                disabled={locked || !typed}
                className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 rounded-xl py-3 text-base font-bold active:scale-95 transition"
              >
                ⌫
              </button>
              <button
                onClick={submitLetterPad}
                disabled={locked || !typed}
                className="bg-green-500 disabled:bg-gray-300 text-white rounded-xl py-3 text-base font-bold active:scale-95 transition"
              >
                ✓
              </button>
            </div>
          </>
        )}

        {feedback !== "none" && (
          <div className="mt-4 space-y-2">
            {feedback === "correct" && (
              <div className="text-center space-y-0.5">
                <p className="text-green-600 font-extrabold text-xl">Correct! 🎉</p>
                {levelUpText && (
                  <p className="text-yellow-600 font-bold text-sm">{levelUpText}</p>
                )}
              </div>
            )}
            {feedback === "wrong" && (
              <p className="text-center text-red-500 font-extrabold text-base">
                Not quite — answer: <span className="uppercase">{question.answer}</span>
              </p>
            )}
            {question.explanation && (
              <p className="text-center text-gray-700 text-sm leading-snug px-1">
                {question.explanation}
              </p>
            )}
            <button
              onClick={() => onAnswer(feedback === "correct")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-2xl active:scale-95 transition text-base"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
