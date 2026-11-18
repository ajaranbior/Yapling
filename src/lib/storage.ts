import type { Card, CardStat, Level, Verdict } from "./types";

export type PracticeMode = "translate" | "repeat";

export interface Settings {
  lang: string;
  level: Level;
  /** Interest ids picked in onboarding (lib/profile.ts). */
  interests: string[];
  /** Onboarding was finished or skipped. */
  onboarded: boolean;
  /** "translate": see the meaning, say it in the target language. "repeat": hear it, say it back. */
  practiceMode: PracticeMode;
  /** Open the mic halfway through the voice so you can talk over the end of it. */
  earlyMic: boolean;
  topics: Record<string, string[]>;
  sessionSize: number;
  sound: boolean;
  /** Start listening automatically after the phrase is spoken. */
  autoMic: boolean;
  /** Hide the target text while you answer (harder). */
  hideTextWhileSpeaking: boolean;
  speechRate: number;
  aiEnabled: boolean;
  aiKey: string;
  aiModel: string;
}

export const DEFAULT_SETTINGS: Settings = {
  lang: "pl",
  level: "beginner",
  interests: [],
  onboarded: false,
  practiceMode: "translate",
  earlyMic: true,
  topics: {},
  sessionSize: 12,
  sound: true,
  autoMic: true,
  hideTextWhileSpeaking: false,
  speechRate: 1,
  aiEnabled: false,
  aiKey: "",
  aiModel: "claude-opus-5-5",
};

const KEYS = { settings: "yapling.settings.v1", stats: "yapling.stats.v1", best: "yapling.best.v1" };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / private mode: the app still works for this session */
  }
}

export const loadSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) });
export const saveSettings = (s: Settings) => write(KEYS.settings, s);

export type Stats = Record<string, CardStat>;
export const loadStats = (): Stats => read<Stats>(KEYS.stats, {});
export const saveStats = (s: Stats) => write(KEYS.stats, s);

export const loadBest = (): Record<string, number> => read(KEYS.best, {});
export const saveBest = (b: Record<string, number>) => write(KEYS.best, b);

/** How much each outcome counts as "trouble" (0 = nailed it, 1 = missed). */
const TROUBLE: Record<Verdict, number> = {
  perfect: 0,
  alternative: 0,
  unnatural: 0.3,
  close: 0.6,
  wrong: 1,
  skipped: 0.7,
};

export function recordAttempt(stats: Stats, lang: string, card: Card, verdict: Verdict): Stats {
  const prev: CardStat = stats[card.key] ?? {
    key: card.key,
    lang,
    text: card.phrase.text,
    translation: card.phrase.translation,
    romanization: card.phrase.romanization,
    kind: card.kind,
    seen: 0,
    correct: 0,
    wrong: 0,
    trouble: 0,
    lastSeen: 0,
  };
  const t = TROUBLE[verdict];
  const next: CardStat = {
    ...prev,
    text: card.phrase.text,
    translation: card.phrase.translation,
    seen: prev.seen + 1,
    correct: prev.correct + (t === 0 ? 1 : 0),
    wrong: prev.wrong + (t >= 0.6 ? 1 : 0),
    // First attempt counts fully; later attempts blend in so one good answer doesn't erase history.
    trouble: prev.seen === 0 ? t : prev.trouble * 0.6 + t * 0.4,
    lastSeen: Date.now(),
  };
  return { ...stats, [card.key]: next };
}

export function troubleList(stats: Stats, lang: string, min = 0.25): CardStat[] {
  return Object.values(stats)
    .filter((s) => s.lang === lang && s.trouble >= min)
    .sort((a, b) => b.trouble - a.trouble || b.wrong - a.wrong);
}
