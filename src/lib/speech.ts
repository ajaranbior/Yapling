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

/** Speak `text`; resolves when done (or after a safety timeout — some browsers never fire `end`). */
export function speak(text: string, tag: string, character: Character, opts: { rate?: number } = {}): Promise<void> {
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
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, 1500 + Array.from(text).length * 180 / (opts.rate ?? 1));
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
}

export function listen(tag: string, onInterim?: (text: string) => void): Listening {
  const Ctor = recognitionCtor();
  if (!Ctor) return { result: Promise.reject(new Error("Speech recognition not supported")), stop() {}, abort() {} };
  const rec = new Ctor();
  rec.lang = tag;
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 5;

  let finals: string[] = [];
  let lastInterim = "";
  const result = new Promise<string[]>((resolve, reject) => {
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finals = Array.from({ length: r.length }, (_, k) => r[k].transcript.trim()).filter(Boolean);
        } else {
          interim += r[0].transcript;
        }
      }
      lastInterim = interim || lastInterim;
      onInterim?.(finals[0] ?? interim);
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return; // onend resolves with what we have
      reject(new Error(e.error));
    };
    rec.onend = () => resolve(finals.length ? finals : lastInterim ? [lastInterim.trim()] : []);
  });
  try {
    rec.start();
  } catch (err) {
    return { result: Promise.reject(err), stop() {}, abort() {} };
  }
  return { result, stop: () => rec.stop(), abort: () => rec.abort() };
}

/** iOS only allows speech after a user gesture: call this from the Start button. */
export function primeTts() {
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  synth.speak(u);
}
