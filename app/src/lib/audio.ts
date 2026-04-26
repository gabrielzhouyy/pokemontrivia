"use client";

// Pre-rendered chiptune-style sound effects. Generated at build time by
// scripts/generate-audio.mjs into /public/audio/*.wav. Browser caches the
// files so playback is instant after the first load.

const FILES = {
  correct: "/audio/correct.wav",
  wrong: "/audio/wrong.wav",
  catch: "/audio/catch.wav",
  evolve: "/audio/evolve.wav",
  click: "/audio/click.wav",
} as const;

type SoundName = keyof typeof FILES;

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

function getAudio(name: SoundName): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!cache[name]) {
    const a = new Audio(FILES[name]);
    a.preload = "auto";
    cache[name] = a;
  }
  return cache[name]!;
}

let muted = false;
export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  if (muted) return true;
  return localStorage.getItem("pmc:muted") === "1";
}
export function setMuted(value: boolean): void {
  muted = value;
  if (typeof window !== "undefined") {
    localStorage.setItem("pmc:muted", value ? "1" : "0");
  }
}

function play(name: SoundName) {
  if (isMuted()) return;
  const a = getAudio(name);
  if (!a) return;
  a.currentTime = 0;
  // Browsers may reject play() before any user interaction. Swallow the
  // rejection — the audio simply won't play until the kid taps something.
  a.play().catch(() => {});
}

export const playCorrect = () => play("correct");
export const playWrong = () => play("wrong");
export const playCatch = () => play("catch");
export const playEvolve = () => play("evolve");
export const playClick = () => play("click");
