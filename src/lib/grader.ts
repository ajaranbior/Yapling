import type { LanguageConfig } from "./languages/types";
import type { GradeResult, Phrase, Verdict } from "./types";

/**
 * Local, offline grader. It is deliberately forgiving: speech recognition is noisy,
 * and the goal is to keep the learner moving. The optional AI grader refines it.
 */

export const POINTS: Record<Verdict, number> = {
  perfect: 10,
  alternative: 10,
  unnatural: 6,
  close: 3,
  wrong: 1,
  skipped: 0,
};

export const isAccepted = (v: Verdict) => v === "perfect" || v === "alternative" || v === "unnatural";

const ACCEPT_THRESHOLD = 0.9;
const CLOSE_THRESHOLD = 0.6;

export function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").replace(/ł/g, "l").replace(/Ł/g, "L");
}

function levenshtein(a: string, b: string): number {
  const A = Array.from(a);
  const B = Array.from(b);
  let prev = Array.from({ length: B.length + 1 }, (_, i) => i);
  for (let i = 1; i <= A.length; i++) {
    const cur = [i];
    for (let j = 1; j <= B.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[B.length];
}

/** 1 for identical (ignoring accents), otherwise normalized edit similarity. */
export function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const sa = stripDiacritics(a);
  const sb = stripDiacritics(b);
  if (sa === sb) return 1;
  const len = Math.max(Array.from(sa).length, Array.from(sb).length);
  return len === 0 ? 1 : 1 - levenshtein(sa, sb) / len;
}

/** Replace every synonym with its group's first entry so swaps compare equal. */
export function canonicalize(lang: LanguageConfig, normalized: string): string {
  const pairs: [string, string][] = [];
  for (const group of lang.synonyms) {
    const canon = lang.normalize(group[0]);
    for (const v of group.slice(1)) pairs.push([lang.normalize(v), canon]);
  }
  pairs.sort((a, b) => b[0].length - a[0].length);
  if (lang.tokenJoiner === " ") {
    let padded = ` ${normalized} `;
    for (const [v, c] of pairs) padded = padded.split(` ${v} `).join(` ${c} `);
    return padded.trim();
  }
  let out = normalized;
  for (const [v, c] of pairs) out = out.split(v).join(c);
  return out;
}

export function prepare(lang: LanguageConfig, text: string): string[] {
  return lang.tokenize(canonicalize(lang, lang.normalize(text)));
}

interface MatchResult {
  /** Harmonic mean of precision and recall over tokens (0..1). */
  f: number;
  recall: number;
  ordered: boolean;
  /** Token pairs that only matched approximately (heard → expected), e.g. wrong endings. */
  fuzzy: { heard: string; expected: string }[];
}

export function matchTokens(heard: string[], expected: string[], threshold: number): MatchResult {
  const usedHeard = new Set<number>();
  const pairIndex: (number | null)[] = expected.map(() => null);
  const fuzzy: MatchResult["fuzzy"] = [];

  // Pass 1: exact (accent-insensitive) matches, nearest position first.
  expected.forEach((e, ei) => {
    let best = -1;
    heard.forEach((h, hi) => {
      if (usedHeard.has(hi) || tokenSimilarity(h, e) < 1) return;
      if (best === -1 || Math.abs(hi - ei) < Math.abs(best - ei)) best = hi;
    });
    if (best !== -1) {
      usedHeard.add(best);
      pairIndex[ei] = best;
    }
  });

  // Pass 2: approximate matches (inflection, ASR spelling slips).
  if (threshold < 1) {
    expected.forEach((e, ei) => {
      if (pairIndex[ei] !== null) return;
      let best = -1;
      let bestSim = threshold;
      heard.forEach((h, hi) => {
        if (usedHeard.has(hi)) return;
        const sim = tokenSimilarity(h, e);
        if (sim >= bestSim) {
          best = hi;
          bestSim = sim;
        }
      });
      if (best !== -1) {
        usedHeard.add(best);
        pairIndex[ei] = best;
        fuzzy.push({ heard: heard[best], expected: e });
      }
    });
  }

  const matched = pairIndex.filter((x): x is number => x !== null);
  const hits = matched.length;
  const total = heard.length + expected.length;
  const f = total === 0 ? 1 : (2 * hits) / total;
  const ordered = matched.every((v, i) => i === 0 || v > matched[i - 1]);
  return { f, recall: expected.length ? hits / expected.length : 1, ordered, fuzzy };
}

/** Expected phrase split for display, with a flag for whether the learner said each part. */
export function computeMarks(lang: LanguageConfig, heardTokens: string[], expectedText: string) {
  const parts = lang.tokenJoiner === " " ? expectedText.split(/\s+/) : Array.from(expectedText);
  const pool = [...heardTokens];
  return parts.map((part) => {
    const tokens = prepare(lang, part);
    if (tokens.length === 0) return { token: part, hit: true }; // punctuation
    const hit = tokens.every((t) => {
      const i = pool.findIndex((h) => tokenSimilarity(h, t) === 1);
      if (i === -1) return false;
      pool.splice(i, 1);
      return true;
    });
    return { token: part, hit };
  });
}

export interface GradeOptions {
  kind?: "word" | "sentence";
}

export function gradeLocally(lang: LanguageConfig, heardRaw: string, phrase: Phrase, opts: GradeOptions = {}): GradeResult {
  const heard = heardRaw.trim();
  const expected = phrase.text;
  const H = prepare(lang, heard);
  const E = prepare(lang, expected);
  const base = { heard, expected, source: "local" as const, marks: computeMarks(lang, H, expected) };
  const result = (verdict: Verdict, extra: Partial<GradeResult> = {}): GradeResult => ({ ...base, verdict, ...extra });

  if (H.length === 0) return result("wrong", { note: "Didn't catch anything — try again?" });

  const same = (a: string[], b: string[]) => a.length === b.length && a.every((t, i) => tokenSimilarity(t, b[i]) === 1);
  if (same(H, E)) return result("perfect");

  const accepts = (phrase.accept ?? []).map((a) => prepare(lang, a));
  if (accepts.some((a) => same(H, a))) return result("alternative", { note: "Also correct!" });

  for (const u of phrase.unnatural ?? []) {
    if (same(H, prepare(lang, u.text))) return result("unnatural", { better: expected, note: u.note });
  }

  // Fuzzy: best match against the expected sentence and every accepted variant.
  const candidates = [E, ...accepts];
  let best = matchTokens(H, E, lang.fuzzyTokenThreshold);
  let bestIsExpected = true;
  for (const c of accepts) {
    const m = matchTokens(H, c, lang.fuzzyTokenThreshold);
    if (m.f > best.f) {
      best = m;
      bestIsExpected = false;
    }
  }

  // Close to a known unnatural phrasing?
  for (const u of phrase.unnatural ?? []) {
    const m = matchTokens(H, prepare(lang, u.text), lang.fuzzyTokenThreshold);
    if (m.f >= ACCEPT_THRESHOLD && m.f > best.f) return result("unnatural", { better: expected, note: u.note });
  }

  // Language-specific "grammatical but not how people say it" checks.
  if (best.f < 1 && lang.naturalness) {
    const hint = lang.naturalness(H, E, expected);
    if (hint) {
      const m = Math.max(...candidates.map((c) => matchTokens(hint.stripped, c, lang.fuzzyTokenThreshold).f));
      if (m >= ACCEPT_THRESHOLD) return result("unnatural", { better: hint.better, note: hint.note });
    }
  }

  // Single words: saying the word inside a longer utterance ("你好啊", "no cześć") is fine.
  if (opts.kind === "word" && best.recall === 1 && best.fuzzy.length === 0) {
    return result("alternative", { note: "Got it!" });
  }

  if (best.f >= ACCEPT_THRESHOLD) {
    if (best.fuzzy.length > 0) {
      const fixes = best.fuzzy.map((p) => `${p.heard} → ${p.expected}`).join(", ");
      return result("close", { better: expected, note: `Almost! Check: ${fixes}` });
    }
    if (!best.ordered) {
      if (lang.wordOrder === "flexible") {
        return result("alternative", { note: `Different word order — that's fine in ${lang.name}.` });
      }
      return result("unnatural", { better: expected, note: `Word order matters in ${lang.name}.` });
    }
    if (best.f === 1) return bestIsExpected ? result("perfect") : result("alternative", { note: "Also correct!" });
    return result("alternative", { note: "Slightly different, but understandable." });
  }

  if (best.f >= CLOSE_THRESHOLD) return result("close", { better: expected, note: "Close! Compare with the sentence below." });
  return result("wrong", { better: expected });
}

// ---------------------------------------------------------------- talking over the voice

const isEchoOf = (head: string[], tail: string[]) => head.length === tail.length && head.every((t, i) => tokenSimilarity(t, tail[i]) >= 0.8);

/**
 * When the mic opens while the voice is still speaking, the transcript can start with
 * the end of the voice's own sentence ("…za pomoc" + "dziękuję bardzo za pomoc").
 * Returns the transcript with each plausible echo prefix removed, so the learner's
 * part can be graded on its own.
 */
export function stripEcho(lang: LanguageConfig, heard: string, expectedText: string): string[] {
  const H = lang.tokenize(lang.normalize(heard));
  const E = lang.tokenize(lang.normalize(expectedText));
  const out: string[] = [];
  for (let k = 1; k < H.length && k <= E.length; k++) {
    if (isEchoOf(H.slice(0, k), E.slice(E.length - k))) out.push(H.slice(k).join(lang.tokenJoiner));
  }
  return out;
}

/** True when everything heard is just the tail end of the voice (the learner hasn't spoken yet). */
export function isOnlyEcho(lang: LanguageConfig, heard: string, expectedText: string): boolean {
  const H = lang.tokenize(lang.normalize(heard));
  const E = lang.tokenize(lang.normalize(expectedText));
  return H.length > 0 && H.length < E.length && isEchoOf(H, E.slice(E.length - H.length));
}

/** Learner-facing hint that shows the shape of the answer without giving it away: "D_______ b_____ z_ p_____". */
export function maskWords(text: string): string {
  return text
    .split(/(\s+)/)
    .map((w) => {
      const letters = Array.from(w);
      const first = letters.findIndex((c) => /\p{L}/u.test(c));
      if (first === -1) return w;
      return letters.map((c, i) => (i === first || !/\p{L}/u.test(c) ? c : "_")).join("");
    })
    .join("");
}
