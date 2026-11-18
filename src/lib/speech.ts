/** Thin wrappers around the Web Speech API (TTS + speech recognition). */

export interface Character {
  id: string;
  name: string;
  emoji: string;
  color: string;
  /** Voice tweaks so characters sound different even when the device has a single voice. */
  pitch: number;
  rate: number;
  /** Which of the available voices for the language this character prefers. */
  voiceSlot: number;
}

export const CHARACTERS: Character[] = [
  { id: "fox", name: "Bo", emoji: "🦊", color: "#fb923c", pitch: 1.0, rate: 1.0, voiceSlot: 0 },
  { id: "panda", name: "Mira", emoji: "🐼", color: "#a3e635", pitch: 1.25, rate: 1.0, voiceSlot: 1 },
  { id: "frog", name: "Kip", emoji: "🐸", color: "#34d399", pitch: 0.8, rate: 0.95, voiceSlot: 2 },
  { id: "octopus", name: "Lulu", emoji: "🐙", color: "#f472b6", pitch: 1.4, rate: 1.05, voiceSlot: 3 },
  { id: "bear", name: "Grum", emoji: "🐻", color: "#d6a36a", pitch: 0.65, rate: 0.92, voiceSlot: 4 },
];

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;

export const ttsSupported = () => !!synth;

let voiceCache: SpeechSynthesisVoice[] = [];
function loadVoices(): SpeechSynthesisVoice[] {
  if (!synth) return [];
  const v = synth.getVoices();
  if (v.length) voiceCache = v;
  return voiceCache;
}
if (synth) {
  loadVoices();
  synth.addEventListener?.("voiceschanged", loadVoices);
}

const norm = (lang: string) => lang.toLowerCase().replace("_", "-");

export function voicesFor(tag: string): SpeechSynthesisVoice[] {
  const prefix = tag.split("-")[0].toLowerCase();
  const all = loadVoices().filter((v) => norm(v.lang).startsWith(prefix));
  // On-device voices first: Chrome's online "Google" voices sound nice but can fail silently
  // (no audio, sometimes no error), especially on macOS. Then exact region, then quality.
  const score = (v: SpeechSynthesisVoice) =>
    (v.localService ? 8 : 0) + (norm(v.lang) === tag.toLowerCase() ? 4 : 0) + (/enhanced|premium|natural|neural|google/i.test(v.name) ? 2 : 0);
  return all.sort((a, b) => score(b) - score(a));
}

export function hasVoiceFor(tag: string): boolean {
  return voicesFor(tag).length > 0;
}

/** The voice a character uses: rotates through on-device voices (online ones only if there are none). */
function voiceFor(tag: string, character: Character): SpeechSynthesisVoice | null {
  const voices = voicesFor(tag);
  const local = voices.filter((v) => v.localService);
  const pool = local.length ? local : voices;
  return pool.length ? pool[character.voiceSlot % pool.length] : null;
}

/** Rough spoken length, used for timeouts and as a fallback when the browser sends no word boundaries. */
export function estimateSpeechMs(text: string, rate = 1): number {
  const chars = Array.from(text);
  const cjk = chars.filter((c) => /\p{Script=Han}/u.test(c)).length;
  return ((chars.length - cjk) * 65 + cjk * 230) / rate;
}

export interface SpeakOptions {
  rate?: number;
  /** Called once, roughly halfway through the utterance (never if it ends first). */
  onHalf?: () => void;
}

/** Recent speech events, newest last: shown by Settings → Test voice to diagnose missing audio. */
export const speechLog: string[] = [];
function logSpeech(msg: string) {
  const t = new Date().toISOString().slice(14, 23);
  speechLog.push(`${t} ${msg}`);
  if (speechLog.length > 40) speechLog.shift();
}

// Chrome garbage-collects utterances that nothing references, and then never fires their events.
let current: SpeechSynthesisUtterance | null = null;
let speakId = 0;
const sleepMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** How long to wait for audio to actually start before trying another voice. */
const START_TIMEOUT_MS = 2500;

/**
 * Speak `text`; resolves when done (or after a safety timeout — some browsers never fire `end`).
 *
 * Chrome quirks handled here: `speak()` straight after `cancel()` is sometimes dropped, the
 * synth can get stuck "paused", and a voice (usually an online one) can fail without a sound.
 * If audio hasn't started after a moment, we try once more with the browser's default voice.
 */
export async function speak(text: string, tag: string, character: Character, opts: SpeakOptions = {}): Promise<void> {
  if (!synth) return;
  const id = ++speakId;
  logSpeech(`speak "${text.slice(0, 24)}" ${tag} · speaking=${synth.speaking} pending=${synth.pending} paused=${synth.paused} · ${loadVoices().length} voices`);
  if (synth.speaking || synth.pending) {
    synth.cancel();
    await sleepMs(60);
    if (id !== speakId) return;
  }
  const preferred = voiceFor(tag, character);
  const started = await speakOnce(text, tag, character, preferred, opts, id);
  if (started || id !== speakId) return;
  console.warn(`Yapling: no audio from voice ${preferred?.name ?? "(default)"}, retrying with the default voice`);
  synth.cancel();
  await sleepMs(60);
  if (id !== speakId) return;
  await speakOnce(text, tag, character, null, opts, id);
}

/** Resolves true once the utterance played (or false if it never started). */
function speakOnce(
  text: string,
  tag: string,
  character: Character,
  voice: SpeechSynthesisVoice | null,
  opts: SpeakOptions,
  id: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!synth) return resolve(true);
    const u = new SpeechSynthesisUtterance(text);
    current = u;
    u.lang = tag;
    if (voice) u.voice = voice;
    // If this character shares a voice with others, the pitch shift keeps them distinct.
    u.pitch = character.pitch;
    u.rate = character.rate * (opts.rate ?? 1);
    u.volume = 1;
    logSpeech(`  try voice: ${voice ? `${voice.name} [${voice.lang}]${voice.localService ? "" : " online"}` : "(browser default)"}`);
    let started = false;
    let done = false;
    let halfDone = !opts.onHalf;
    let halfTimer: ReturnType<typeof setTimeout> | undefined;
    let endTimer: ReturnType<typeof setTimeout> | undefined;
    const half = () => {
      if (halfDone || done) return;
      halfDone = true;
      clearTimeout(halfTimer);
      opts.onHalf?.();
    };
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      clearTimeout(halfTimer);
      if (current === u) current = null;
      resolve(ok);
    };
    // A superseded call (another speak() or stopSpeaking()) counts as played: nothing to retry.
    const startTimer = setTimeout(() => {
      if (!started) logSpeech(`  no start after ${START_TIMEOUT_MS}ms (speaking=${synth.speaking} pending=${synth.pending})`);
      finish(id !== speakId || started);
    }, START_TIMEOUT_MS);
    u.onstart = () => {
      logSpeech("  start");
      started = true;
      clearTimeout(startTimer);
      endTimer = setTimeout(() => finish(true), 1500 + (Array.from(text).length * 180) / (opts.rate ?? 1));
      // Clock starts when audio actually starts (voices can take a moment to load).
      if (opts.onHalf) halfTimer = setTimeout(half, estimateSpeechMs(text, u.rate) * 0.5);
    };
    if (opts.onHalf) {
      u.onboundary = (e) => {
        if (e.charIndex >= text.length * 0.5) half();
      };
    }
    u.onend = () => {
      logSpeech("  end");
      finish(true);
    };
    u.onerror = (e) => {
      logSpeech(`  error: ${e.error}`);
      // "interrupted"/"canceled" = we stopped it on purpose; anything else before audio started means try another voice.
      const intentional = e.error === "interrupted" || e.error === "canceled";
      finish(started || intentional || id !== speakId);
    };
    synth.resume(); // Chrome can be left paused (e.g. after the tab was in the background)
    synth.speak(u);
  });
}

export function stopSpeaking() {
  speakId++;
  synth?.cancel();
}

// ---------------------------------------------------------------- recognition

type RecognitionCtor = new () => SpeechRecognitionLike;
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function recognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const asrSupported = () => !!recognitionCtor();

export interface Listening {
  /** Resolves with candidate transcripts (best first). Empty array = heard nothing. */
  result: Promise<string[]>;
  stop(): void;
  abort(): void;
  /** Held sessions (see `hold`) start ending on silence only after this is called. */
  release(): void;
}

export interface ListenOptions {
  onInterim?: (text: string) => void;
  /**
   * Keep listening across pauses and decide ourselves when the learner is done.
   * Used when the mic opens while the voice is still talking: the recogniser may
   * pick up the end of the voice first and the learner's answer after it.
   */
  continuous?: boolean;
  /** Continuous only: don't end on silence until `release()` (e.g. until the voice has finished). */
  hold?: boolean;
  /** Continuous only: quiet time after speech that ends the turn. */
  silenceMs?: number;
}

export function listen(tag: string, opts: ListenOptions = {}): Listening {
  const Ctor = recognitionCtor();
  const noop = () => {};
  if (!Ctor) return { result: Promise.reject(new Error("Speech recognition not supported")), stop: noop, abort: noop, release: noop };
  const rec = new Ctor();
  const continuous = !!opts.continuous;
  rec.lang = tag;
  rec.continuous = continuous;
  rec.interimResults = true;
  rec.maxAlternatives = 5;

  // One entry per recognised segment, each with the recogniser's alternatives.
  const segments: string[][] = [];
  let interim = "";
  let held = continuous && !!opts.hold;
  let releasedAt = held ? Infinity : Date.now();
  const startedAt = Date.now();
  let lastResultAt = 0;
  let poll: ReturnType<typeof setInterval> | undefined;

  const candidates = (): string[] => {
    const tops = segments.map((s) => s[0] ?? "");
    const tail = interim.trim();
    const all = [...tops, tail].filter(Boolean);
    if (all.length === 0) return [];
    const out = [all.join(" ")];
    // Alternatives for the last segment, keeping earlier ones as heard.
    const last = segments[segments.length - 1];
    if (last && !tail) for (const alt of last.slice(1)) out.push([...tops.slice(0, -1), alt].filter(Boolean).join(" "));
    // Each segment on its own: the learner's answer is often a separate segment from the voice's echo.
    if (all.length > 1) out.push(...all);
    return [...new Set(out.map((s) => s.trim()).filter(Boolean))];
  };

  const result = new Promise<string[]>((resolve, reject) => {
    rec.onresult = (e) => {
      lastResultAt = Date.now();
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) segments[i] = Array.from({ length: r.length }, (_, k) => r[k].transcript.trim()).filter(Boolean);
        else live += r[0].transcript;
      }
      interim = live;
      opts.onInterim?.(candidates()[0] ?? "");
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return; // onend resolves with what we have
      clearInterval(poll);
      reject(new Error(e.error));
    };
    rec.onend = () => {
      clearInterval(poll);
      resolve(candidates());
    };
  });

  if (continuous) {
    const silenceMs = opts.silenceMs ?? 1100;
    poll = setInterval(() => {
      const now = Date.now();
      if (now - startedAt > 20_000) return rec.stop();
      if (held) return;
      const spokeSinceRelease = lastResultAt > releasedAt;
      const quiet = now - Math.max(lastResultAt, releasedAt);
      if (spokeSinceRelease && quiet >= silenceMs) rec.stop();
      // Heard something before the voice finished (an answer spoken over it, or just its echo) and nothing since.
      else if (!spokeSinceRelease && lastResultAt > 0 && quiet >= 2200) rec.stop();
      else if (lastResultAt === 0 && quiet >= 7000) rec.stop();
    }, 150);
  }

  try {
    rec.start();
  } catch (err) {
    clearInterval(poll);
    return { result: Promise.reject(err), stop: noop, abort: noop, release: noop };
  }
  return {
    result,
    stop: () => rec.stop(),
    abort: () => rec.abort(),
    release: () => {
      if (!held) return;
      held = false;
      releasedAt = Date.now();
    },
  };
}

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

/**
 * iOS only allows speech after a user gesture: call this from the Start button. Not done
 * elsewhere: on desktop Chrome a silent blank utterance can leave the speech queue stuck.
 */
export function primeTts() {
  if (!synth || !isIOS()) return;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  synth.speak(u);
}
