import { describe, expect, it } from "vitest";
import { gradeLocally, isOnlyEcho, maskWords, stripEcho } from "./grader";
import { polish } from "./languages/pl";
import { mandarin } from "./languages/zh";
import type { Phrase } from "./types";

const find = (lang: typeof polish, text: string): Phrase => {
  for (const t of lang.topics) for (const i of t.items) for (const p of [i.word, ...i.sentences]) if (p.text === text) return p;
  throw new Error(`missing ${text}`);
};

describe("polish grading", () => {
  const glodny = find(polish, "Jestem bardzo głodny.");
  it("exact (case/punctuation-insensitive) is perfect", () => {
    expect(gradeLocally(polish, "jestem bardzo głodny", glodny).verdict).toBe("perfect");
  });
  it("missing diacritics still perfect", () => {
    expect(gradeLocally(polish, "jestem bardzo glodny", glodny).verdict).toBe("perfect");
  });
  it("free word order is an accepted alternative", () => {
    expect(gradeLocally(polish, "Bardzo jestem głodny", glodny).verdict).toBe("alternative");
  });
  it("listed variant is alternative", () => {
    expect(gradeLocally(polish, "Jestem strasznie głodna", glodny).verdict).toBe("alternative");
  });
  it("redundant pronoun is unnatural with a better suggestion", () => {
    const r = gradeLocally(polish, "Ja jestem bardzo głodny", glodny);
    expect(r.verdict).toBe("unnatural");
    expect(r.better).toBe("Jestem bardzo głodny.");
  });
  it("synonym swap (dziś/dzisiaj) is accepted", () => {
    const p = find(polish, "Dzisiaj jest ładna pogoda.");
    expect(gradeLocally(polish, "Dziś jest ładna pogoda", p).verdict).toBe("perfect");
  });
  it("wrong ending is close", () => {
    const p = find(polish, "Poproszę kawę z mlekiem.");
    const r = gradeLocally(polish, "Poproszę kawa z mlekiem", p);
    expect(r.verdict).toBe("close");
    expect(r.marks?.find((m) => m.token === "kawę")?.hit).toBe(false);
  });
  it("listed unnatural phrasing", () => {
    const p = find(polish, "Mam na imię Anna.");
    expect(gradeLocally(polish, "Moje imię jest Anna", p).verdict).toBe("unnatural");
  });
  it("unrelated is wrong", () => {
    const p = find(polish, "Mam na imię Anna.");
    expect(gradeLocally(polish, "Gdzie jest dworzec", p).verdict).toBe("wrong");
  });
  it("empty is wrong", () => {
    expect(gradeLocally(polish, "  ", glodny).verdict).toBe("wrong");
  });
});

describe("numbers written as digits by speech recognition", () => {
  it("accepts a digit for an inflected Polish numeral", () => {
    const p = find(polish, "Pracuję tu od trzech lat i wciąż się uczę.");
    expect(gradeLocally(polish, "Pracuję tu od 3 lat i Wciąż się uczę", p).verdict).toBe("perfect");
  });
  it("accepts digits for Polish ordinals and compound numbers", () => {
    const at: Phrase = { text: "Spotkajmy się o piątej.", translation: "" };
    expect(gradeLocally(polish, "Spotkajmy się o 5", at).verdict).toBe("perfect");
    const age: Phrase = { text: "Mam dwadzieścia trzy lata.", translation: "" };
    expect(gradeLocally(polish, "Mam 23 lata", age).verdict).toBe("perfect");
    const year: Phrase = { text: "Urodziłam się w tysiąc dziewięćset dziewięćdziesiątym piątym roku.", translation: "" };
    expect(gradeLocally(polish, "Urodziłam się w 1995 roku", year).verdict).toBe("perfect");
  });
  it("a wrong number is still wrong", () => {
    const p = find(polish, "Pracuję tu od trzech lat i wciąż się uczę.");
    expect(gradeLocally(polish, "Pracuję tu od 4 lat i wciąż się uczę", p).verdict).not.toBe("perfect");
  });
  it("accepts digits for Mandarin numerals", () => {
    const two: Phrase = { text: "我要两个。", translation: "" };
    expect(gradeLocally(mandarin, "我要2个", two).verdict).toBe("perfect");
    const ten: Phrase = { text: "我十五岁。", translation: "" };
    expect(gradeLocally(mandarin, "我15岁", ten).verdict).toBe("perfect");
    const year: Phrase = { text: "我二零二四年来的。", translation: "" };
    expect(gradeLocally(mandarin, "我2024年来的", year).verdict).toBe("perfect");
  });
});

describe("mandarin grading", () => {
  const where = find(mandarin, "火车站在哪儿？");
  it("exact without punctuation", () => {
    expect(gradeLocally(mandarin, "火车站在哪儿", where).verdict).toBe("perfect");
  });
  it("哪里 synonym", () => {
    expect(gradeLocally(mandarin, "火车站在哪里？", where).verdict).toBe("perfect");
  });
  it("listed unnatural reordering", () => {
    expect(gradeLocally(mandarin, "哪儿是火车站", where).verdict).toBe("unnatural");
  });
  it("是 before adjective is unnatural", () => {
    const p = find(mandarin, "我今天很累。");
    const r = gradeLocally(mandarin, "我今天是很累", p);
    expect(r.verdict).toBe("unnatural");
  });
  it("digits normalize", () => {
    const p = find(mandarin, "我要一杯咖啡。");
    expect(gradeLocally(mandarin, "我要1杯咖啡", p).verdict).toBe("perfect");
  });
  it("word inside a longer utterance", () => {
    const p = find(mandarin, "你好");
    expect(gradeLocally(mandarin, "你好啊", p, { kind: "word" }).verdict).toBe("alternative");
  });
  it("one wrong character is close", () => {
    const p = find(mandarin, "我在办公室工作。");
    expect(gradeLocally(mandarin, "我再办公室工作", p).verdict).toBe("close");
  });
});

describe("talking over the voice", () => {
  it("strips the voice's tail from the start of the transcript", () => {
    const out = stripEcho(polish, "za pomoc dziękuję bardzo za pomoc", "Dziękuję bardzo za pomoc.");
    expect(out).toContain("dziękuję bardzo za pomoc");
  });
  it("works for Mandarin characters", () => {
    expect(stripEcho(mandarin, "的帮助谢谢你的帮助", "谢谢你的帮助。")).toContain("谢谢你的帮助");
  });
  it("detects a transcript that is only the echo", () => {
    expect(isOnlyEcho(polish, "za pomoc", "Dziękuję bardzo za pomoc.")).toBe(true);
    expect(isOnlyEcho(polish, "dziękuję bardzo za pomoc", "Dziękuję bardzo za pomoc.")).toBe(false);
  });
  it("masks all but the first letter of each word", () => {
    expect(maskWords("Nie, dziękuję.")).toBe("N__, d_______.");
  });
});
