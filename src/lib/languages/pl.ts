import { polishTopics } from "../../content/pl";
import type { LanguageConfig } from "./types";

const PRONOUNS = new Set(["ja", "ty", "on", "ona", "ono", "my", "wy", "oni", "one"]);

export const polish: LanguageConfig = {
  code: "pl",
  name: "Polish",
  nativeName: "Polski",
  flag: "🇵🇱",
  speechTag: "pl-PL",
  wordOrder: "flexible",
  hasRomanization: false,
  normalize: (text) =>
    text
      .toLocaleLowerCase("pl-PL")
      .replace(/[.,!?;:"„”“«»()\-–—…]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  tokenize: (n) => (n ? n.split(" ") : []),
  tokenJoiner: " ",
  synonyms: [
    ["dzisiaj", "dziś"],
    ["dziękuję", "dzięki"],
    ["cześć", "hej", "siema"],
    ["toaleta", "łazienka"],
  ],
  fuzzyTokenThreshold: 0.74,
  naturalness(heard, expected, expectedText) {
    // Polish is pro-drop: "Ja jestem głodny" is understood but sounds emphatic/foreign.
    const extra = heard.filter((t) => PRONOUNS.has(t) && !expected.includes(t));
    if (extra.length === 0) return null;
    return {
      better: expectedText,
      note: `Polish usually drops "${extra[0]}" — the verb ending already tells who.`,
      stripped: heard.filter((t) => !extra.includes(t)),
    };
  },
  topics: polishTopics,
};
