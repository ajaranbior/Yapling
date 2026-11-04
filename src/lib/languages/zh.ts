import { mandarinTopics } from "../../content/zh";
import type { LanguageConfig } from "./types";

const DIGITS = "零一二三四五六七八九";

export const mandarin: LanguageConfig = {
  code: "zh",
  name: "Mandarin",
  nativeName: "中文",
  flag: "🇨🇳",
  speechTag: "zh-CN",
  wordOrder: "strict",
  hasRomanization: true,
  normalize: (text) =>
    text
      // full-width → half-width so "ＡＢＣ１２３" compares like "ABC123"
      .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/[0-9]/g, (d) => DIGITS[Number(d)])
      .toLowerCase()
      .replace(/[\s.,!?;:'"()\-–—…，。！？；：、“”‘’（）《》·~]/g, ""),
  // Characters are the comparison unit (speech recognisers don't segment words consistently).
  tokenize: (n) => Array.from(n),
  tokenJoiner: "",
  synonyms: [
    ["哪儿", "哪里"],
    ["这儿", "这里"],
    ["那儿", "那里"],
    ["星期六", "周六", "礼拜六"],
    ["今天晚上", "今晚"],
    ["没有时间", "没时间"],
    ["看起来", "看上去"],
    ["您", "你"],
    ["不好意思", "对不起"],
  ],
  fuzzyTokenThreshold: 1,
  naturalness(heard, expected, expectedText) {
    // 我是饿 / 我是累 — a classic: 是 doesn't go before adjectives.
    if (heard.includes("是") && !expected.includes("是")) {
      return {
        better: expectedText,
        note: "Adjectives don't take 是 — use 很 (or just the adjective + 了).",
        stripped: heard.filter((t) => t !== "是"),
      };
    }
    // 我是一个学生 — the measure phrase is usually dropped after 是.
    const joined = heard.join("");
    if (joined.includes("一个") && !expected.join("").includes("一个")) {
      return {
        better: expectedText,
        note: "Fine, but 一个 is usually dropped here.",
        stripped: Array.from(joined.replace("一个", "")),
      };
    }
    return null;
  },
  topics: mandarinTopics,
};
