import type { Phrase, Topic } from "../lib/types";

/**
 * Append levelled sentences to existing items by id. New sentences go at the end of
 * each item's list so existing card keys (`…:s0`, `…:s1`) stay stable.
 */
export function withSentences(topics: Topic[], extra: Record<string, Phrase[]>): Topic[] {
  const used = new Set<string>();
  const out = topics.map((t) => ({
    ...t,
    items: t.items.map((item) => {
      const more = extra[item.id];
      if (!more) return item;
      used.add(item.id);
      return { ...item, sentences: [...item.sentences, ...more] };
    }),
  }));
  const unknown = Object.keys(extra).filter((id) => !used.has(id));
  if (unknown.length) throw new Error(`Levelled sentences for unknown items: ${unknown.join(", ")}`);
  return out;
}
