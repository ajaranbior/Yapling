# Yapling

**▶ Live app: https://ajaranbior.github.io/Yapling/**

A quick, ADHD-friendly language-learning web app. You learn a word, then get challenged to say sentences that use it: you see the English and say it in the target language (or, in repeat mode, hear it and say it back). Grading is flexible: you can change the word order or use a synonym, and the app still shows you the expected sentence. If your sentence is understandable but a native wouldn't say it that way, the app suggests a more natural version.

Languages: **Polish** and **Mandarin** (it is built so more can be added).

## Features

- **Your level.** Beginner, intermediate or advanced. Sentences follow your level (intermediate adds past/future, opinions, longer sentences; advanced adds conditionals, idioms and nuance).
- **Your interests.** A short, skippable setup asks your level and what you want to talk about (travel, food, friends, work, daily life, hobbies). Matching topics come first. Change it anytime from Home.
- **Translate challenge (default).** See the meaning, say it in the target language. 💡 Hint shows the first letter of each word (pinyin for Mandarin), then the full answer; hints lower the points. After answering you hear how it's said. *Repeat* mode is still there.
- **Back and forward.** ◀ Back returns to the previous card; accepted answers move on quickly by themselves.
- **Talk over the voice.** In repeat mode the mic opens halfway through the phrase, so you can start speaking early. The end of the voice that the mic picks up is cut out of what you said before grading. Turn it off in ⚙️ Settings if the voice cuts out on your phone.
- **Word, then usage.** Each new word is followed right away by a sentence that uses it (the word is highlighted, including inflected forms). A second sentence comes back a few cards later.
- **Different voices.** Five characters, each with its own browser TTS voice, pitch and speed. There are 🔊 replay and 🐢 slow buttons.
- **Speak or type.** Speech recognition through the Web Speech API. The mic can start by itself after each phrase. Typing is the fallback.
- **Flexible grading.**
  - 🎯 *perfect*: matches the expected sentence (ignoring punctuation, case and missing diacritics)
  - ✅ *alternative*: a different but natural wording (free word order in Polish, synonyms, listed variants). The expected sentence is still shown.
  - 👌 *unnatural*: understandable, but the app shows how natives say it (e.g. Polish `Ja jestem bardzo głodny` → `Jestem bardzo głodny`, or Mandarin `我是饿` → `我饿了`)
  - 🤏 *close*: wrong ending or a small mistake. The words you missed are highlighted.
  - 💪 *wrong*: you still get a point for trying
- **Optional Claude grading.** Add an Anthropic API key in ⚙️ Settings. Answers that aren't an exact match then get judged for meaning and naturalness, with a suggested fix.
- **Fast pace.** Accepted answers move on by themselves (briefly longer when there's an alternative to read). There are sounds, a score that pops up, streaks 🔥 and a mascot that reacts to each answer.
- **Fixed-length sessions** (8, 12, 20 or 30 cards) with a summary at the end. Missed cards come back later in the same session.
- **Trouble spots.** The app tracks which cards you miss most and lets you practise them in their own session.
- **Mobile-first layout.** Keyboard shortcuts on desktop: `Space` talk/next · `←` back · `→` next/skip · `H` hint · `R` replay · `S` skip · `T` type.

Progress and settings are saved in `localStorage`. The API key stays in your browser and is sent only to `api.anthropic.com`.

## Browser support

| Feature | Chrome / Edge (desktop + Android) | Safari (iOS / macOS) | Firefox |
|---|---|---|---|
| Voices (TTS) | ✅ | ✅ | ✅ |
| Speaking (recognition) | ✅ | ✅ | ❌ (typing fallback) |

You need a Polish or Chinese TTS voice installed on the device. Most phones have them, and the app warns you if one is missing.

## Development

Contributors and coding agents: see [AGENTS.md](AGENTS.md). Work is committed and pushed straight to `main` (no PRs).


```bash
npm install
npm run dev      # http://localhost:5173 (use --host URL on your phone; mic needs HTTPS or localhost)
npm test         # grader unit tests
npm run build
```

Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Adding a language

1. Add the content in `src/content/<code>.ts`: topics (with the `interests` they serve), then items, each with a `word` and its `sentences`. Items and sentences can set a `level` (default beginner). Every phrase can list `accept` (other natural wordings) and `unnatural` (variants with a note).
2. Add `src/lib/languages/<code>.ts` with a `LanguageConfig`. It sets the speech tag, `wordOrder` (`flexible` / `strict`), normalization, tokenization (words, or characters for zh), synonyms, the fuzzy-match threshold and an optional `naturalness` hook.
3. Register it in `src/lib/languages/index.ts`.

## Project layout

```
src/
  content/            phrase data per language
  lib/languages/      per-language config (normalize, tokenize, synonyms, naturalness hints)
  lib/grader.ts       offline flexible grader (+ grader.test.ts)
  lib/aiGrader.ts     optional Claude grading (lazy-loaded)
  lib/deck.ts         session builder (level, interests, word → sentence, spacing, trouble weighting)
  lib/profile.ts      interests + level labels for onboarding
  lib/speech.ts       TTS characters + speech recognition
  lib/sounds.ts       synthesized UI sounds
  lib/storage.ts      settings, per-card stats, trouble scores
  components/         Onboarding, Home, SessionView, Summary, Trouble, SettingsSheet, Mascot
```
