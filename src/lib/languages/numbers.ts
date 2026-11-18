import type { NumberSpan } from "./types";

// ---------------------------------------------------------------- Polish

/** Cardinal forms in every case (and gender) that a learner might need. */
const PL_CARDINALS: [number, string[]][] = [
  [0, ["zero", "zera", "zeru", "zerem"]],
  [1, ["jeden", "jedna", "jedno", "jednego", "jednej", "jednemu", "jednym", "jedną"]],
  [2, ["dwa", "dwie", "dwaj", "dwóch", "dwu", "dwom", "dwoma", "dwiema"]],
  [3, ["trzy", "trzej", "trzech", "trzem", "trzema"]],
  [4, ["cztery", "czterej", "czterech", "czterem", "czterema"]],
  [5, ["pięć", "pięciu", "pięcioma"]],
  [6, ["sześć", "sześciu", "sześcioma"]],
  [7, ["siedem", "siedmiu", "siedmioma"]],
  [8, ["osiem", "ośmiu", "ośmioma"]],
  [9, ["dziewięć", "dziewięciu", "dziewięcioma"]],
  [10, ["dziesięć", "dziesięciu", "dziesięcioma"]],
  [11, ["jedenaście", "jedenastu", "jedenastoma"]],
  [12, ["dwanaście", "dwunastu", "dwunastoma"]],
  [13, ["trzynaście", "trzynastu", "trzynastoma"]],
  [14, ["czternaście", "czternastu", "czternastoma"]],
  [15, ["piętnaście", "piętnastu", "piętnastoma"]],
  [16, ["szesnaście", "szesnastu", "szesnastoma"]],
  [17, ["siedemnaście", "siedemnastu", "siedemnastoma"]],
  [18, ["osiemnaście", "osiemnastu", "osiemnastoma"]],
  [19, ["dziewiętnaście", "dziewiętnastu", "dziewiętnastoma"]],
  [20, ["dwadzieścia", "dwudziestu", "dwudziestoma"]],
  [30, ["trzydzieści", "trzydziestu", "trzydziestoma"]],
  [40, ["czterdzieści", "czterdziestu", "czterdziestoma"]],
  [50, ["pięćdziesiąt", "pięćdziesięciu", "pięćdziesięcioma"]],
  [60, ["sześćdziesiąt", "sześćdziesięciu", "sześćdziesięcioma"]],
  [70, ["siedemdziesiąt", "siedemdziesięciu", "siedemdziesięcioma"]],
  [80, ["osiemdziesiąt", "osiemdziesięciu", "osiemdziesięcioma"]],
  [90, ["dziewięćdziesiąt", "dziewięćdziesięciu", "dziewięćdziesięcioma"]],
  [100, ["sto", "stu", "stoma"]],
  [200, ["dwieście", "dwustu", "dwustoma"]],
  [300, ["trzysta", "trzystu", "trzystoma"]],
  [400, ["czterysta", "czterystu", "czterystoma"]],
  [500, ["pięćset", "pięciuset"]],
  [600, ["sześćset", "sześciuset"]],
  [700, ["siedemset", "siedmiuset"]],
  [800, ["osiemset", "ośmiuset"]],
  [900, ["dziewięćset", "dziewięciuset"]],
];

/** Ordinal stems ("trzeci", "trzeciego", "trzeciej"…): ASR writes "3 maja", "o 5". */
const PL_ORDINAL_STEMS: [number, string][] = [
  [1, "pierwsz"], [2, "drug"], [3, "trzec"], [4, "czwart"], [5, "piąt"], [6, "szóst"], [7, "siódm"],
  [8, "ósm"], [9, "dziewiąt"], [10, "dziesiąt"], [11, "jedenast"], [12, "dwunast"], [13, "trzynast"],
  [14, "czternast"], [15, "piętnast"], [16, "szesnast"], [17, "siedemnast"], [18, "osiemnast"],
  [19, "dziewiętnast"], [20, "dwudziest"], [30, "trzydziest"], [40, "czterdziest"], [50, "pięćdziesiąt"],
  [60, "sześćdziesiąt"], [70, "siedemdziesiąt"], [80, "osiemdziesiąt"], [90, "dziewięćdziesiąt"], [100, "setn"],
];
const PL_ORDINAL_ENDINGS = "y|i|a|e|ie|ego|iego|ej|iej|emu|iemu|ym|im|ą|ych|ich|ymi|imi";

const PL_WORDS = new Map<string, number>();
for (const [v, forms] of PL_CARDINALS) for (const f of forms) PL_WORDS.set(f, v);
const PL_ORDINAL_RE = PL_ORDINAL_STEMS.map(([v, stem]) => [v, new RegExp(`^${stem}(?:${PL_ORDINAL_ENDINGS})$`)] as const);
const PL_THOUSAND = /^tysi(?:ąc|ąca|ące|ęcy|ącem|ącu|ącach|ącami|ącom)$/;

function polishWordValue(w: string): number | null {
  const v = PL_WORDS.get(w);
  if (v !== undefined) return v;
  for (const [n, re] of PL_ORDINAL_RE) if (re.test(w)) return n;
  return null;
}

/** 0 for units/teens, 1 for tens, 2 for hundreds: a number phrase goes strictly downwards. */
const magnitude = (v: number) => (v >= 100 ? 2 : v >= 20 ? 1 : 0);

export function polishNumbers(tokens: string[]): NumberSpan[] {
  const spans: NumberSpan[] = [];
  let i = 0;
  while (i < tokens.length) {
    const first = polishWordValue(tokens[i]);
    if (first === null && !PL_THOUSAND.test(tokens[i])) {
      i++;
      continue;
    }
    const start = i;
    let total = 0;
    let current = 0;
    let lastMag = 3;
    let thousands = false;
    while (i < tokens.length) {
      const w = tokens[i];
      if (PL_THOUSAND.test(w) && !thousands) {
        total += (current || 1) * 1000;
        current = 0;
        lastMag = 3;
        thousands = true;
        i++;
        continue;
      }
      const v = polishWordValue(w);
      if (v === null || magnitude(v) >= lastMag) break;
      current += v;
      lastMag = magnitude(v);
      i++;
    }
    spans.push({ start, end: i, value: total + current });
  }
  return spans;
}

// ---------------------------------------------------------------- Mandarin

const ZH_DIGITS: Record<string, number> = {
  零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
};
const ZH_UNITS: Record<string, number> = { 十: 10, 百: 100, 千: 1000 };
const isZhNumeral = (c: string) => c in ZH_DIGITS || c in ZH_UNITS || c === "万";

function mandarinValue(chars: string[]): number {
  // Years and phone numbers are read digit by digit: 二零二四.
  if (!chars.some((c) => c in ZH_UNITS || c === "万")) {
    return Number(chars.map((c) => ZH_DIGITS[c]).join(""));
  }
  let total = 0;
  let section = 0;
  let num = 0;
  for (const c of chars) {
    if (c in ZH_DIGITS) num = ZH_DIGITS[c];
    else if (c === "万") {
      total += (section + num) * 10000;
      section = 0;
      num = 0;
    } else {
      section += (num || 1) * ZH_UNITS[c];
      num = 0;
    }
  }
  return total + section + num;
}

export function mandarinNumbers(tokens: string[]): NumberSpan[] {
  const spans: NumberSpan[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (!isZhNumeral(tokens[i])) {
      i++;
      continue;
    }
    const start = i;
    while (i < tokens.length && isZhNumeral(tokens[i])) i++;
    spans.push({ start, end: i, value: mandarinValue(tokens.slice(start, i)) });
  }
  return spans;
}
