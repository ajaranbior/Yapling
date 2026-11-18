import { describe, expect, it } from "vitest";
import { buildLearnDeck } from "./deck";
import { recordAttempt, stageOf, type Stats } from "./storage";
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

  it("introduces new words at your level first", () => {
    const deck = buildLearnDeck(polish, { topicIds: [], size: 8, level: "beginner", interests: [] }, {});
    expect(deck[0]).toMatchObject({ kind: "word", mode: "learn" });
    const adv = buildLearnDeck(polish, { topicIds: [], size: 8, level: "advanced", interests: [] }, {});
    // Beginner words are assumed known at advanced level: no word cards for them.
    expect(adv.filter((c) => c.kind === "word").every((c) => levelOf(polish, c.key) === 2)).toBe(true);
  });

  for (const level of ["beginner", "intermediate", "advanced"] as Level[])
    it(`${level}: everything new is introduced before it's asked for`, () => {
      const deck = buildLearnDeck(polish, { topicIds: [], size: 20, level, interests: [] }, {});
      expect(deck.every((c) => c.mode === "learn")).toBe(true);
    });
});

describe("learn → echo → recall across sessions", () => {
  // One topic and a big session, so every card is in every deck (review order is shuffled).
  const opts = { topicIds: ["basics"], size: 60, level: "beginner" as Level, interests: [] };
  const play = (stats: Stats, verdict: "perfect" | "dunno") => {
    const deck = buildLearnDeck(polish, opts, stats);
    return { deck, stats: deck.reduce((s, c) => recordAttempt(s, "pl", c, verdict), stats) };
  };

  it("moves a card up one stage per session and back to the start on dunno", () => {
    let { deck, stats } = play({}, "perfect");
    const key = deck[0].key;
    expect(deck[0].mode).toBe("learn");
    expect(stageOf(stats[key])).toBe(1);

    const card = { ...deck[0] };
    expect(buildLearnDeck(polish, opts, stats).find((c) => c.key === key)?.mode).toBe("echo");
    stats = recordAttempt(stats, "pl", card, "perfect");
    expect(stageOf(stats[key])).toBe(2);
    expect(buildLearnDeck(polish, opts, stats).find((c) => c.key === key)?.mode).toBe("recall");

    stats = recordAttempt(stats, "pl", card, "dunno");
    expect(stageOf(stats[key])).toBe(0);
    const again = buildLearnDeck(polish, opts, stats).find((c) => c.key === key);
    expect(again?.mode).toBe("learn");
  });

  it("infers a stage for stats saved before stages existed", () => {
    expect(stageOf({ seen: 3, trouble: 0.1 } as never)).toBe(2);
    expect(stageOf({ seen: 3, trouble: 0.8 } as never)).toBe(1);
    expect(stageOf(undefined)).toBe(0);
  });
});
