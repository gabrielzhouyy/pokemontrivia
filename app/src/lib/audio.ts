"use client";

// Lightweight WebAudio synth — no asset files needed for a v1 prototype.
// Generates Game-Boy-ish chiptune blips for catch / correct / wrong / evolve.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "square", gain = 0.08, delay = 0) {
  const c = getCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function isMuted() {
  if (typeof window === "undefined") return false;
  if (muted) return true;
  return localStorage.getItem("pmc:muted") === "1";
}

export function setMuted(value: boolean) {
  muted = value;
  if (typeof window !== "undefined") {
    localStorage.setItem("pmc:muted", value ? "1" : "0");
  }
}

export function playCorrect() {
  if (isMuted()) return;
  tone(880, 0.08);
  tone(1320, 0.12, "square", 0.08, 0.07);
}

export function playWrong() {
  if (isMuted()) return;
  tone(220, 0.18, "sawtooth", 0.06);
}

export function playCatch() {
  if (isMuted()) return;
  // Gameboy-ish ascending arpeggio.
  const notes = [523, 659, 784, 1047, 1319]; // C E G C E
  notes.forEach((f, i) => tone(f, 0.12, "square", 0.09, i * 0.09));
  tone(1568, 0.32, "square", 0.1, notes.length * 0.09);
}

export function playEvolve() {
  if (isMuted()) return;
  const seq = [392, 523, 659, 784, 988, 1175, 1319, 1568];
  seq.forEach((f, i) => tone(f, 0.1, "triangle", 0.08, i * 0.08));
}

export function playClick() {
  if (isMuted()) return;
  tone(660, 0.04, "square", 0.05);
}
