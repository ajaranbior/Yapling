import { polish } from "./pl";
import { mandarin } from "./zh";
import type { LanguageConfig } from "./types";

/** Register new languages here. */
export const LANGUAGES: LanguageConfig[] = [polish, mandarin];

export function getLanguage(code: string): LanguageConfig {
  const lang = LANGUAGES.find((l) => l.code === code);
  if (!lang) throw new Error(`Unknown language: ${code}`);
  return lang;
}

export type { LanguageConfig } from "./types";
