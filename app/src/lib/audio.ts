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
    // Gotta catch 'em all … you teach me and I'll teach you
    // Notes: G5=784, A5=880, B5=988, C6=1047 — same range as the evolve fanfare
    // All durations +10% vs original, gain +10% vs original
    const G5 = 784;
    const A5 = 880;
    const C6 = 1047;
    const _  = 0; // rest
    const notes: [number, number][] = [
      // "Gotta catch 'em all" riff: d f g2, d d f g2, g2, d f g2
      [G5, 0.12], [A5, 0.12], [C6, 0.24],
      [_,  0.06],
      [G5, 0.12], [G5, 0.12], [A5, 0.12], [C6, 0.24],
      [_,  0.06],
      [C6, 0.35],
      [_,  0.06],
      [G5, 0.12], [A5, 0.12], [C6, 0.46],
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
      gain.gain.setValueAtTime(0.36, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    // AudioContext not available (e.g. SSR or restricted context) — silently skip
  }
}
