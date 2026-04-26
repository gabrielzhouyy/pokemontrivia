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

// evolve: 8-note rising triangle fanfare
{
  const seq = [392, 523, 659, 784, 988, 1175, 1319, 1568];
  const total = seq.length * 0.08 + 0.05;
  const buf = new Float32Array(Math.floor(total * SAMPLE_RATE));
  seq.forEach((f, i) =>
    renderTone({
      buffer: buf,
      offset: Math.floor(i * 0.08 * SAMPLE_RATE),
      duration: 0.1,
      freq: f,
      type: "triangle",
      gain: 0.3,
    }),
  );
  writeWav("evolve.wav", buf);
}

// click: short blip
{
  const buf = new Float32Array(Math.floor(0.06 * SAMPLE_RATE));
  renderTone({ buffer: buf, offset: 0, duration: 0.04, freq: 660, type: "square", gain: 0.2 });
  writeWav("click.wav", buf);
}

console.log("wrote 5 wav files to", OUT);
