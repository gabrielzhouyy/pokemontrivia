// Generates chiptune-style .wav files for the game's sound effects.
// Pure Node, no dependencies — writes raw 16-bit PCM mono WAV files.
// Re-run with: node scripts/generate-audio.mjs
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "audio");

const SAMPLE_RATE = 22050;

function squareWave(t, freq) {
  return Math.sin(2 * Math.PI * freq * t) >= 0 ? 1 : -1;
}
function triangleWave(t, freq) {
  const phase = (freq * t) % 1;
  return phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
}
function sawWave(t, freq) {
  return 2 * ((freq * t) % 1) - 1;
}

function renderTone({ buffer, offset, duration, freq, type = "square", gain = 0.3 }) {
  const samples = Math.floor(duration * SAMPLE_RATE);
  const attack = 0.005;
  const release = Math.max(0.02, duration * 0.4);
  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1;
    if (t < attack) env = t / attack;
    else if (t > duration - release) env = Math.max(0, (duration - t) / release);
    let wave;
    if (type === "square") wave = squareWave(t, freq);
    else if (type === "triangle") wave = triangleWave(t, freq);
    else wave = sawWave(t, freq);
    if (offset + i < buffer.length) buffer[offset + i] += wave * env * gain;
  }
}

function writeWav(name, buffer) {
  const samples = buffer.length;
  const dataLen = samples * 2;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLen, 40);

  const data = Buffer.alloc(dataLen);
  for (let i = 0; i < samples; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    data.writeInt16LE(Math.floor(s * 32767), i * 2);
  }
  writeFileSync(join(OUT, name), Buffer.concat([header, data]));
}

// correct: high-low blip
{
  const buf = new Float32Array(Math.floor(0.25 * SAMPLE_RATE));
  renderTone({ buffer: buf, offset: 0, duration: 0.08, freq: 880, type: "square", gain: 0.35 });
  renderTone({
    buffer: buf,
    offset: Math.floor(0.07 * SAMPLE_RATE),
    duration: 0.12,
    freq: 1320,
    type: "square",
    gain: 0.35,
  });
  writeWav("correct.wav", buf);
}

// wrong: low buzz
{
  const buf = new Float32Array(Math.floor(0.2 * SAMPLE_RATE));
  renderTone({ buffer: buf, offset: 0, duration: 0.18, freq: 220, type: "saw", gain: 0.25 });
  writeWav("wrong.wav", buf);
}

// catch: ascending arpeggio + tail
{
  const notes = [523, 659, 784, 1047, 1319];
  const total = notes.length * 0.09 + 0.34;
  const buf = new Float32Array(Math.floor(total * SAMPLE_RATE));
  notes.forEach((f, i) =>
    renderTone({
      buffer: buf,
      offset: Math.floor(i * 0.09 * SAMPLE_RATE),
      duration: 0.12,
      freq: f,
      type: "square",
      gain: 0.35,
    }),
  );
  renderTone({
    buffer: buf,
    offset: Math.floor(notes.length * 0.09 * SAMPLE_RATE),
    duration: 0.3,
    freq: 1568,
    type: "square",
    gain: 0.4,
  });
  writeWav("catch.wav", buf);
}

// evolve: GB-accurate evolution fanfare
// Phase 1 — fast ascending sweep (C4→G5, 6 notes × 0.055s = 0.33s)
// Phase 2 — triumphant stepwise climb (G5→A5→B5→C6 held, ~0.72s)
// Two square-wave voices (main + harmony on phase 2) for DMG two-channel texture.
{
  const sweep  = [262, 330, 392, 523, 659, 784]; // C4 E4 G4 C5 E5 G5
  const main   = [784, 880, 988, 1047];           // G5 A5 B5 C6
  const harm   = [523, 587, 659, 784];            // C5 D5 E5 G5

  const sweepStep = 0.055;
  const p2Durs    = [0.11, 0.11, 0.11, 0.38];    // durations per phase-2 note
  const p2Start   = sweep.length * sweepStep;     // 0.33s
  const total     = p2Start + p2Durs.reduce((a, b) => a + b, 0); // ~1.05s

  const buf = new Float32Array(Math.floor(total * SAMPLE_RATE));

  // Phase 1 — fast sweep
  sweep.forEach((f, i) =>
    renderTone({
      buffer: buf,
      offset: Math.floor(i * sweepStep * SAMPLE_RATE),
      duration: sweepStep + 0.02,
      freq: f,
      type: "square",
      gain: 0.32,
    }),
  );

  // Phase 2 — main voice
  let t = p2Start;
  main.forEach((f, i) => {
    const dur = p2Durs[i];
    renderTone({ buffer: buf, offset: Math.floor(t * SAMPLE_RATE), duration: dur, freq: f, type: "square", gain: 0.35 });
    t += dur;
  });

  // Phase 2 — harmony voice (same timing, lower gain)
  t = p2Start;
  harm.forEach((f, i) => {
    const dur = p2Durs[i];
    renderTone({ buffer: buf, offset: Math.floor(t * SAMPLE_RATE), duration: dur, freq: f, type: "square", gain: 0.18 });
    t += dur;
  });

  writeWav("evolve.wav", buf);
}

// click: short blip
{
  const buf = new Float32Array(Math.floor(0.06 * SAMPLE_RATE));
  renderTone({ buffer: buf, offset: 0, duration: 0.04, freq: 660, type: "square", gain: 0.2 });
  writeWav("click.wav", buf);
}

console.log("wrote 5 wav files to", OUT);
