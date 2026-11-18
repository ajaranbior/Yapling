import type { Level } from "./types";

/** What the learner wants to talk about. Topics list the interest ids they serve. */
export const INTERESTS: { id: string; label: string; emoji: string }[] = [
  { id: "travel", label: "Travelling", emoji: "✈️" },
  { id: "food", label: "Food & eating out", emoji: "🍜" },
  { id: "social", label: "Making friends", emoji: "🫶" },
  { id: "work", label: "Work & career", emoji: "💼" },
  { id: "daily", label: "Daily life", emoji: "🏠" },
  { id: "hobbies", label: "Hobbies & free time", emoji: "🎸" },
];

export const LEVEL_INFO: Record<Level, { label: string; emoji: string; blurb: string }> = {
  beginner: { label: "Beginner", emoji: "🌱", blurb: "Short, everyday phrases" },
  intermediate: { label: "Intermediate", emoji: "🌿", blurb: "Longer sentences, past & future, opinions" },
  advanced: { label: "Advanced", emoji: "🌳", blurb: "Complex grammar, idioms, nuance" },
};
