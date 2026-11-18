import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { LanguageConfig } from "./languages/types";
import type { GradeResult, Phrase } from "./types";


const GradeSchema = z.object({
  verdict: z.enum(["perfect", "alternative", "unnatural", "close", "wrong"]),
  better: z.string().nullable(),
  note: z.string().nullable(),
});

const SYSTEM = `You grade spoken answers in a fast-paced language-learning app.
Depending on the mode, the learner either heard the target sentence and said it back, or only saw its English meaning and had to say it in the target language themselves (so other wordings are more likely and fine). Their answer came from speech recognition, so ignore punctuation, capitalisation and obvious recognition slips (homophones, missing accents).
The learner is allowed to diverge: different word order, synonyms or a different construction are fine as long as the meaning is the same.

Verdicts:
- perfect: same as the target (allowing recognition noise).
- alternative: different wording, same meaning, and something a native speaker would naturally say.
- unnatural: same meaning and understandable, but a native wouldn't phrase it that way (calque, stiff, odd word order, redundant pronoun, wrong register...). Put the most natural phrasing in "better".
- close: meaning mostly there but with a real grammar or vocabulary mistake. Put the corrected sentence in "better".
- wrong: different meaning, or mostly missing.

"note": one short, friendly sentence in English explaining the main issue (or null for perfect). Keep it under 15 words.
"better": null for perfect and alternative.`;

export interface AiSettings {
  apiKey: string;
  model: string;
}

let cached: { key: string; client: Anthropic } | null = null;
function client(apiKey: string) {
  if (cached?.key !== apiKey) {
    // The key lives only in this browser (localStorage) and is sent straight to Anthropic.
    cached = { key: apiKey, client: new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 }) };
  }
  return cached.client;
}

export async function gradeWithAi(
  settings: AiSettings,
  lang: LanguageConfig,
  phrase: Phrase,
  heard: string,
  mode: "translate" | "repeat",
  signal?: AbortSignal,
): Promise<Pick<GradeResult, "verdict" | "better" | "note">> {
  const known = [
    phrase.accept?.length ? `Known natural alternatives: ${phrase.accept.join(" | ")}` : "",
    phrase.unnatural?.length ? `Known unnatural variants: ${phrase.unnatural.map((u) => u.text).join(" | ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client(settings.apiKey).beta.messages.parse(
    {
      model: settings.model,
      max_tokens: 2000,
      output_config: { effort: "low", format: betaZodOutputFormat(GradeSchema) },
      // On a policy decline, let the API re-route to a suitable model instead of failing
      // (server-side fallbacks aren't offered for Haiku).
      ...(settings.model.includes("haiku")
        ? {}
        : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }),
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Language: ${lang.name}
Mode: ${mode === "translate" ? "translate (learner only saw the English)" : "repeat (learner heard the target)"}
Target (${phrase.translation}): ${phrase.text}
${known}
Learner said: ${heard}`,
        },
      ],
    },
    { signal, timeout: 15_000 },
  );

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`AI grading unavailable (${response.stop_reason})`);
  }
  const out = response.parsed_output;
  return { verdict: out.verdict, better: out.better ?? undefined, note: out.note ?? undefined };
}
