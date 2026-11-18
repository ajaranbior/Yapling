export type Level = "beginner" | "intermediate" | "advanced";
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
export const levelRank = (l: Level | undefined) => LEVELS.indexOf(l ?? "beginner");

/** A single thing the learner hears and then says back (a word or a sentence). */
export interface Phrase {
  /** Text in the target language, written the way a native speaker would. */
  text: string;
  /** Translation into the learner's language (English for now). */
  translation: string;
  /** Optional romanization (e.g. pinyin) for scripts that need it. */
  romanization?: string;
  /** Other fully natural ways of saying the same thing. Accepted with full points. */
  accept?: string[];
  /** Things a learner might say that are understandable but sound off, with a hint. */
  unnatural?: { text: string; note: string }[];
  /** Difficulty of a sentence. Defaults to the item's level. */
  level?: Level;
}

export interface ContentItem {
  id: string;
  /** Level at which the word itself is introduced (default "beginner"). */
  level?: Level;
  /** The new word introduced first. */
  word: Phrase;
  /** Sentences that use the word — the "emergent" step from word to usage. */
  sentences: Phrase[];
}

export interface Topic {
  id: string;
  name: string;
  emoji: string;
  /** Interest ids (see lib/profile.ts) this topic serves; used to tailor sessions. */
  interests: string[];
  items: ContentItem[];
}

/** "dunno": the learner said they don't know it — it drops back to being re-introduced. */
export type Verdict = "perfect" | "alternative" | "unnatural" | "close" | "wrong" | "skipped" | "dunno";

/**
 * How a card is practised, from its stage in stats:
 * - learn: new (or forgotten) — see it, hear it, parrot it back.
 * - echo: hear it without the text, say it back.
 * - recall: see the meaning, say it yourself.
 */
export type CardMode = "learn" | "echo" | "recall";

export interface GradeResult {
  verdict: Verdict;
  heard: string;
  expected: string;
  /** A more natural way to say it (shown for "unnatural" / "close"). */
  better?: string;
  /** Short explanation for the learner. */
  note?: string;
  /** Expected tokens with a flag for whether the learner hit each one. */
  marks?: { token: string; hit: boolean }[];
  /** Who produced the grade. */
  source: "local" | "ai";
}

export interface Card {
  /** Stable key used for stats: `${lang}:${itemId}:w` or `${lang}:${itemId}:s${n}`. */
  key: string;
  kind: "word" | "sentence";
  phrase: Phrase;
  itemId: string;
  topicId: string;
  /** The word this card builds on (sentence cards show it as a hint). */
  focusWord?: string;
  /** How this card is practised this time (see CardMode). Defaults to "recall". */
  mode?: CardMode;
}

export interface CardStat {
  key: string;
  lang: string;
  text: string;
  translation: string;
  romanization?: string;
  kind: Card["kind"];
  seen: number;
  correct: number;
  wrong: number;
  /** Exponentially-weighted error rate, 0..1. Higher = more trouble. */
  trouble: number;
  lastSeen: number;
  /**
   * Knowledge stage: 0 = (re)introduce, 1 = echo, 2+ = recall. Moves up one step per session
   * on a good answer, down on a miss, back to 0 on "dunno". Missing on old stats (see stageOf).
   */
  stage?: number;
}
