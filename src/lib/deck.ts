import type { LanguageConfig } from "./languages/types";
import type { Stats } from "./storage";
import type { Card, ContentItem } from "./types";

export function cardKey(lang: string, itemId: string, n: number | "w") {
  return `${lang}:${itemId}:${n === "w" ? "w" : `s${n}`}`;
}

function itemCards(lang: LanguageConfig, topicId: string, item: ContentItem): Card[] {
  return [
    { key: cardKey(lang.code, item.id, "w"), kind: "word", phrase: item.word, itemId: item.id, topicId },
    ...item.sentences.map((s, i) => ({
      key: cardKey(lang.code, item.id, i),
      kind: "sentence" as const,
      phrase: s,
      itemId: item.id,
      topicId,
      focusWord: item.word.text,
    })),
  ];
}

export function allCards(lang: LanguageConfig): Card[] {
  return lang.topics.flatMap((t) => t.items.flatMap((i) => itemCards(lang, t.id, i)));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a session: new words are introduced and immediately used in a sentence
 * (word → sentence), a second sentence comes back a few cards later (spacing),
 * and cards you've struggled with before are mixed in.
 */
export function buildLearnDeck(lang: LanguageConfig, topicIds: string[], size: number, stats: Stats): Card[] {
  const topics = lang.topics.filter((t) => topicIds.length === 0 || topicIds.includes(t.id));
  const items = topics.flatMap((t) => t.items.map((item) => ({ item, topicId: t.id })));

  const seen = (key: string) => (stats[key]?.seen ?? 0) > 0;
  const trouble = (key: string) => stats[key]?.trouble ?? 0;

  // New items first (in content order so difficulty ramps), then the rest by how shaky they are.
  const fresh = items.filter(({ item }) => !seen(cardKey(lang.code, item.id, "w")));
  const known = shuffle(items.filter(({ item }) => seen(cardKey(lang.code, item.id, "w"))));
  known.sort((a, b) => {
    const ta = Math.max(...itemCards(lang, a.topicId, a.item).map((c) => trouble(c.key)));
    const tb = Math.max(...itemCards(lang, b.topicId, b.item).map((c) => trouble(c.key)));
    return tb - ta;
  });

  const deck: Card[] = [];
  const delayed: { card: Card; due: number }[] = [];
  const flushDue = () => {
    for (let i = delayed.length - 1; i >= 0; i--) {
      if (delayed[i].due <= deck.length) deck.push(delayed.splice(i, 1)[0].card);
    }
  };

  // Mix: two fresh items, then one known item, so it doesn't feel like a wall of new stuff.
  const order: typeof items = [];
  while (fresh.length || known.length) {
    if (fresh.length) order.push(fresh.shift()!);
    if (fresh.length) order.push(fresh.shift()!);
    if (known.length) order.push(known.shift()!);
  }

  for (const { item, topicId } of order) {
    if (deck.length >= size) break;
    const cards = itemCards(lang, topicId, item);
    const [word, ...sentences] = cards;
    const isNew = !seen(word.key);
    if (isNew || trouble(word.key) > 0.25) deck.push(word);
    // Known items: lead with their shakiest sentence.
    const ordered = isNew ? sentences : [...sentences].sort((a, b) => trouble(b.key) - trouble(a.key));
    if (ordered[0]) deck.push(ordered[0]);
    if (ordered[1]) delayed.push({ card: ordered[1], due: deck.length + 3 });
    flushDue();
  }
  while (delayed.length && deck.length < size) deck.push(delayed.shift()!.card);
  return deck.slice(0, size);
}

/** A session made only of cards you've had trouble with. */
export function buildReviewDeck(lang: LanguageConfig, keys: string[], size: number): Card[] {
  const byKey = new Map(allCards(lang).map((c) => [c.key, c]));
  return keys
    .map((k) => byKey.get(k))
    .filter((c): c is Card => !!c)
    .slice(0, size);
}
