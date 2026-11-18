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

export function voicesFor(tag: string): SpeechSynthesisVoice[] {
  const prefix = tag.split("-")[0].toLowerCase();
  const all = loadVoices().filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(prefix));
  // Prefer exact region match, then higher-quality ("Enhanced"/"Premium"/"Natural"/Google) voices.
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.toLowerCase().replace("_", "-") === tag.toLowerCase() ? 4 : 0) +
    (/enhanced|premium|natural|neural|google/i.test(v.name) ? 2 : 0) +
    (v.localService ? 1 : 0);
  return all.sort((a, b) => score(b) - score(a));
}

export function hasVoiceFor(tag: string): boolean {
  return voicesFor(tag).length > 0;
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

/** Speak `text`; resolves when done (or after a safety timeout — some browsers never fire `end`). */
export function speak(text: string, tag: string, character: Character, opts: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!synth) return resolve();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = tag;
    const voices = voicesFor(tag);
    if (voices.length) u.voice = voices[character.voiceSlot % voices.length];
    // If this character shares a voice with others, the pitch shift keeps them distinct.
    u.pitch = character.pitch;
    u.rate = character.rate * (opts.rate ?? 1);
    let done = false;
    let halfDone = !opts.onHalf;
    let halfTimer: ReturnType<typeof setTimeout> | undefined;
    const half = () => {
      if (halfDone || done) return;
      halfDone = true;
      clearTimeout(halfTimer);
      opts.onHalf?.();
    };
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearTimeout(halfTimer);
      resolve();
    };
    const timer = setTimeout(finish, 1500 + (Array.from(text).length * 180) / (opts.rate ?? 1));
    if (opts.onHalf) {
      // Clock starts when audio actually starts (voices can take a moment to load).
      u.onstart = () => {
        halfTimer = setTimeout(half, estimateSpeechMs(text, u.rate) * 0.5);
      };
      u.onboundary = (e) => {
        if (e.charIndex >= text.length * 0.5) half();
      };
    }
    u.onend = finish;
    u.onerror = finish;
    synth.speak(u);
  });
}

export function stopSpeaking() {
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

/** iOS only allows speech after a user gesture: call this from the Start button. */
export function primeTts() {
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  synth.speak(u);
}
