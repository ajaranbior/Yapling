import { describe, expect, it } from "vitest";
import { buildLearnDeck } from "./deck";
import { polish } from "./languages/pl";
import { mandarin } from "./languages/zh";
import { levelRank, type Level } from "./types";

const levelOf = (lang: typeof polish, key: string): number => {
  const [, itemId, part] = key.split(":");
  for (const t of lang.topics)
    for (const i of t.items)
      if (i.id === itemId) return part === "w" ? levelRank(i.level) : levelRank(i.sentences[Number(part.slice(1))].level ?? i.level);
  throw new Error(key);
};

describe("levelled decks", () => {
  for (const lang of [polish, mandarin])
    for (const level of ["beginner", "intermediate", "advanced"] as Level[]) {
      it(`${lang.code} ${level}: nothing above the level, sentences at the level`, () => {
        const deck = buildLearnDeck(lang, { topicIds: [], size: 30, level, interests: [] }, {});
        expect(deck.length).toBe(30);
        const L = levelRank(level);
        for (const c of deck) expect(levelOf(lang, c.key)).toBeLessThanOrEqual(L);
        const sentences = deck.filter((c) => c.kind === "sentence");
        expect(sentences.every((c) => levelOf(lang, c.key) === L)).toBe(true);
      });
    }

  it("puts topics matching the learner's interests first", () => {
    const deck = buildLearnDeck(polish, { topicIds: [], size: 8, level: "beginner", interests: ["hobbies"] }, {});
    expect(deck[0].topicId).toBe("hobbies");
  });

  it("introduces new words at your level with an intro card", () => {
    const deck = buildLearnDeck(polish, { topicIds: [], size: 8, level: "beginner", interests: [] }, {});
    expect(deck[0]).toMatchObject({ kind: "word", intro: true });
    const adv = buildLearnDeck(polish, { topicIds: [], size: 8, level: "advanced", interests: [] }, {});
    // Beginner words are assumed known at advanced level: no intro cards for them.
    expect(adv.filter((c) => c.intro).every((c) => levelOf(polish, c.key) === 2)).toBe(true);
  });
});
