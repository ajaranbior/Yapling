import type { LanguageConfig } from "./languages/types";
import { modeForStage, stageOf, type Stats } from "./storage";
import { levelRank, type Card, type ContentItem, type Level, type Phrase } from "./types";

export function cardKey(lang: string, itemId: string, n: number | "w") {
  return `${lang}:${itemId}:${n === "w" ? "w" : `s${n}`}`;
}

const sentenceLevel = (item: ContentItem, s: Phrase) => levelRank(s.level ?? item.level);

function wordCard(lang: LanguageConfig, topicId: string, item: ContentItem): Card {
  return { key: cardKey(lang.code, item.id, "w"), kind: "word", phrase: item.word, itemId: item.id, topicId };
}

function sentenceCards(lang: LanguageConfig, topicId: string, item: ContentItem): Card[] {
  return item.sentences.map((s, i) => ({
    key: cardKey(lang.code, item.id, i),
    kind: "sentence" as const,
    phrase: s,
    itemId: item.id,
    topicId,
    focusWord: item.word.text,
  }));
}

export function allCards(lang: LanguageConfig): Card[] {
  return lang.topics.flatMap((t) => t.items.flatMap((i) => [wordCard(lang, t.id, i), ...sentenceCards(lang, t.id, i)]));
}

/**
 * Sentences that fit the learner's level: the ones written for that level, or, if the
 * item has none, the ones from the closest easier level.
 */
export function sentencesForLevel(lang: LanguageConfig, topicId: string, item: ContentItem, level: Level): Card[] {
  const L = levelRank(level);
  const cards = sentenceCards(lang, topicId, item).map((c, i) => ({ c, lvl: sentenceLevel(item, item.sentences[i]) }));
  const best = Math.max(-1, ...cards.filter((x) => x.lvl <= L).map((x) => x.lvl));
  return cards.filter((x) => x.lvl === best).map((x) => x.c);
}

/** Set each card's mode (learn / echo / recall) from how well it's known. */
export function withModes(cards: Card[], stats: Stats): Card[] {
  return cards.map((c) => ({ ...c, mode: modeForStage(stageOf(stats[c.key])) }));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface DeckOptions {
  topicIds: string[];
  size: number;
  level: Level;
  /** Interest ids from onboarding; matching topics come first. */
  interests: string[];
}

/**
 * Build a session: new words are introduced and immediately used in a sentence
 * (word → sentence), a second sentence comes back a few cards later (spacing),
 * and cards you've struggled with before are mixed in. Every card's mode comes from
 * its stage, so anything new — at any level — is introduced before it's asked for.
 */
export function buildLearnDeck(lang: LanguageConfig, opts: DeckOptions, stats: Stats): Card[] {
  const { topicIds, size, level, interests } = opts;
  const L = levelRank(level);
  const topics = lang.topics.filter((t) => topicIds.length === 0 || topicIds.includes(t.id));
  const likes = (topicId: string) => {
    const t = lang.topics.find((x) => x.id === topicId);
    return !!t && t.interests.some((i) => interests.includes(i));
  };
  const items = topics
    .flatMap((t) => t.items.map((item) => ({ item, topicId: t.id })))
    .filter(({ item }) => levelRank(item.level) <= L)
    .map((x) => ({ ...x, sentences: sentencesForLevel(lang, x.topicId, x.item, level) }))
    .filter((x) => x.sentences.length > 0);

  const seen = (key: string) => (stats[key]?.seen ?? 0) > 0;
  const trouble = (key: string) => stats[key]?.trouble ?? 0;
  const itemSeen = (x: (typeof items)[number]) => seen(cardKey(lang.code, x.item.id, "w")) || x.sentences.some((c) => seen(c.key));

  // New items first (interest topics first, otherwise content order so difficulty ramps),
  // then the rest by how shaky they are.
  const fresh = items.filter((x) => !itemSeen(x));
  if (interests.length) fresh.sort((a, b) => Number(likes(b.topicId)) - Number(likes(a.topicId)));
  // Lowest stage among the item's cards that have been seen: < 2 means still being learned (learn/echo).
  const minStage = (x: (typeof items)[number]) => {
    const keys = [cardKey(lang.code, x.item.id, "w"), ...x.sentences.map((c) => c.key)].filter(seen);
    return Math.min(...keys.map((k) => stageOf(stats[k])));
  };
  const inProgress = (x: (typeof items)[number]) => minStage(x) < 2;
  const known = shuffle(items.filter(itemSeen));
  known.sort((a, b) => {
    const ta = Math.max(...a.sentences.map((c) => trouble(c.key)), trouble(cardKey(lang.code, a.item.id, "w")));
    const tb = Math.max(...b.sentences.map((c) => trouble(c.key)), trouble(cardKey(lang.code, b.item.id, "w")));
    return Number(inProgress(b)) - Number(inProgress(a)) || tb - ta || Number(likes(b.topicId)) - Number(likes(a.topicId));
  });

  const deck: Card[] = [];
  const delayed: { card: Card; due: number }[] = [];
  const flushDue = () => {
    for (let i = delayed.length - 1; i >= 0; i--) {
      if (delayed[i].due <= deck.length) deck.push(delayed.splice(i, 1)[0].card);
    }
  };

  // Mix: two fresh items, then one known item, so it doesn't feel like a wall of new stuff.
  // Items you're still learning (from earlier sessions) alternate one-to-one, so they move on.
  const order: typeof items = [];
  while (fresh.length || known.length) {
    if (fresh.length) order.push(fresh.shift()!);
    if (fresh.length && !(known.length && inProgress(known[0]))) order.push(fresh.shift()!);
    if (known.length) order.push(known.shift()!);
  }

  for (const x of order) {
    if (deck.length >= size) break;
    const word = wordCard(lang, x.topicId, x.item);
    const isNew = !itemSeen(x);
    // Words below your level are assumed known: go straight to (being introduced to) a sentence using them.
    const wordAtLevel = levelRank(x.item.level) === L || L === 0;
    // A word you've started learning keeps coming back until you've recalled it once.
    const wordLearning = seen(word.key) && stageOf(stats[word.key]) < 3;
    if ((isNew && wordAtLevel) || wordLearning || trouble(word.key) > 0.25) deck.push(word);
    // Known items: lead with their shakiest sentence.
    const ordered = isNew
      ? x.sentences
      : [...x.sentences].sort((a, b) => stageOf(stats[a.key]) - stageOf(stats[b.key]) || trouble(b.key) - trouble(a.key));
    if (ordered[0]) deck.push(ordered[0]);
    if (ordered[1]) delayed.push({ card: ordered[1], due: deck.length + 3 });
    flushDue();
  }
  while (delayed.length && deck.length < size) deck.push(delayed.shift()!.card);
  return withModes(deck.slice(0, size), stats);
}

/** A session made only of cards you've had trouble with. */
export function buildReviewDeck(lang: LanguageConfig, keys: string[], size: number, stats: Stats): Card[] {
  const byKey = new Map(allCards(lang).map((c) => [c.key, c]));
  const cards = keys
    .map((k) => byKey.get(k))
    .filter((c): c is Card => !!c)
    .slice(0, size);
  return withModes(cards, stats);
}
