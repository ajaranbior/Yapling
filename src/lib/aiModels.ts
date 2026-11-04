// Kept separate from aiGrader so the SDK is only downloaded when AI grading is used.
export const AI_MODELS = [
  { id: "claude-opus-5-5", label: "Claude Opus 5.5 (best judgement)" },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (balanced)" },
  { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 (fastest, cheapest)" },
] as const;
