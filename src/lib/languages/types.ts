import type { Topic } from "../types";

export interface NaturalnessHint {
  /** Replace with this suggestion (usually the expected sentence). */
  better: string;
  note: string;
  /** Heard tokens with the unnatural bit removed, used to check the rest still matches. */
  stripped: string[];
}

/**
 * Everything the app needs to know about a language. To add a language,
 * create a new file next to `pl.ts` / `zh.ts` and register it in `index.ts`.
 */
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  /** BCP-47 tag used for both speech synthesis and recognition. */
  speechTag: string;
  /**
   * "flexible": reordering the same words is fine (Polish, Russian, ...).
   * "strict": reordering usually changes meaning or sounds wrong (Mandarin, English, ...).
   */
  wordOrder: "flexible" | "strict";
  /** Whether to show romanization (pinyin, romaji, ...). */
  hasRomanization: boolean;
  /** Lowercase, strip punctuation, unify number forms, etc. */
  normalize(text: string): string;
  /** Split a normalized string into comparable units (words, or characters for zh). */
  tokenize(normalized: string): string[];
  /** How to glue tokens back together for display ("" for zh, " " for pl). */
  tokenJoiner: string;
  /**
   * Groups of interchangeable tokens. Tokens in the same group compare equal,
   * and a swap is treated as an accepted alternative.
   */
  synonyms: string[][];
  /** Minimum similarity (0..1) for two tokens to count as "the same word" (inflection / ASR slips). */
  fuzzyTokenThreshold: number;
  /**
   * Language-specific check run when an answer is otherwise acceptable.
   * Return a hint when it is grammatical but a native wouldn't say it that way.
   */
  naturalness?(heardTokens: string[], expectedTokens: string[], expected: string): NaturalnessHint | null;
  topics: Topic[];
}
