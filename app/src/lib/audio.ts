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

// "Gotta catch 'em all" ending riff: d f g2, d d f g2, g2, d f g2
export function playMaxLevel(): void {
  if (isMuted()) return;
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    // d=G5, f=A5, g2=C6 — same pitch range as the evolve fanfare
    const D = 784;   // G5
    const F = 880;   // A5
    const G2 = 1047; // C6
    const _ = 0;     // rest
    const notes: [number, number][] = [
      [D, 0.11], [F, 0.11], [G2, 0.22],
      [_, 0.05],
      [D, 0.11], [D, 0.11], [F, 0.11], [G2, 0.22],
      [_, 0.05],
      [G2, 0.32],
      [_, 0.05],
      [D, 0.11], [F, 0.11], [G2, 0.42],
    ];
    let t = ctx.currentTime + 0.05;
    for (const [freq, dur] of notes) {
      if (freq === 0) { t += dur; continue; }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.33, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    // AudioContext not available (e.g. SSR or restricted context) — silently skip
  }
}
