import type { Verdict } from "./types";

/** Tiny synthesized UI sounds (no audio files). */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled || typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.18, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Call once from a user gesture so iOS unlocks audio. */
export function unlockAudio() {
  tone(440, 0, 0.01, "sine", 0.0002);
}

export function playVerdict(v: Verdict, streak = 0) {
  // Higher streaks nudge the pitch up a little — a subtle "you're on fire" cue.
  const lift = Math.pow(2, Math.min(streak, 8) / 24);
  switch (v) {
    case "perfect":
    case "alternative":
      tone(784 * lift, 0, 0.12, "triangle");
      tone(1047 * lift, 0.08, 0.14, "triangle");
      tone(1319 * lift, 0.16, 0.22, "triangle", 0.14);
      break;
    case "unnatural":
      tone(659, 0, 0.12, "triangle");
      tone(880, 0.1, 0.2, "triangle", 0.12);
      break;
    case "close":
      tone(523, 0, 0.12, "sine");
      tone(587, 0.1, 0.16, "sine", 0.12);
      break;
    case "wrong":
      tone(330, 0, 0.25, "sawtooth", 0.07, 220);
      break;
    case "skipped":
    case "dunno":
      tone(392, 0, 0.08, "sine", 0.08);
      break;
  }
}

export const playMicOn = () => tone(880, 0, 0.06, "sine", 0.08);
export const playMicOff = () => tone(660, 0, 0.06, "sine", 0.06);

export function playStreak() {
  [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.05, 0.12, "triangle", 0.08));
}

export function playFinish() {
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.2, "triangle", 0.14));
}
