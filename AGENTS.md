# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, etc.) working on Yapling.

## Git workflow (important)

- **Commit and push straight to `main`.** Do not open pull requests and do not leave work on feature branches.
- Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`), so before every push run:
  ```bash
  npm test && npm run build
  ```
  Both must pass. Never push a red build.
- Keep commits focused, with a short imperative subject line and a body that says why.
- If a push is rejected because `main` moved, `git pull --rebase origin main`, re-run tests and build, and push again. Never force-push `main`.

## What this is

A mobile-first, ADHD-friendly speaking app (React 19 + Vite + TypeScript, no backend). The learner sees a prompt,
says the sentence out loud, and a forgiving grader gives feedback. Languages: Polish and Mandarin.
Live: https://ajaranbior.github.io/Yapling/

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest (grader + deck tests)
npm run typecheck
npm run build
```

## Layout

```
src/
  content/<lang>.ts     phrase data: topics → items (word + sentences); levelled sentences + interest topics at the bottom
  content/util.ts       withSentences(): appends levelled sentences to items by id
  lib/languages/        per-language config (normalize, tokenize, synonyms, naturalness hints)
  lib/grader.ts         offline grader, echo stripping (talking over the voice), hint masking
  lib/aiGrader.ts       optional Claude grading (lazy-loaded, user's own key, browser-only)
  lib/deck.ts           session builder: level filter, interests first, word → sentence spacing, trouble weighting
  lib/speech.ts         TTS characters (with a halfway callback) + speech recognition (single-shot or continuous/held)
  lib/profile.ts        interests + level labels used by onboarding
  lib/storage.ts        settings, per-card stats, trouble scores (localStorage)
  components/           Onboarding, Home, SessionView, Summary, Trouble, SettingsSheet, Mascot
```

## How a session works

- **Onboarding**: language → level in that language → interests. Levels are per language (`Settings.levels`);
  switching to a language with no level yet asks for one. The old single `level` setting is only migrated from.
- **Levels** (`beginner` / `intermediate` / `advanced`): items and sentences carry an optional `level`
  (default: beginner; a sentence defaults to its item's level). A learner only gets items at or below their level,
  and for each item only the sentences of the highest level that fits. Words below the learner's level skip the
  word card (their sentences are still introduced).
- **Interests**: topics list the interest ids they serve (`Topic.interests`); new items from matching topics come first.
- **Stages, not modes**: each card has a stage in stats (`CardStat.stage`, see `stageOf`/`modeForStage` in
  `storage.ts`) that sets its `Card.mode`: `learn` (stage 0: text + audio, parrot it back) → `echo` (stage 1: hear it,
  text hidden, say it back) → `recall` (stage 2+: see the English, say it, with hints). Only the first attempt per
  session is recorded, so a card moves up at most one stage per session; a wrong answer moves it down, and the
  🤷 **Dunno** button (`dunno` verdict) resets it to 0, re-introduces it on the spot and brings it back later in the
  session. Everything new is introduced before it's asked for, at every level. Items still being learned get more
  room in the next session's deck.
- **Early mic** (learn/echo cards): the mic opens about halfway through the voice in continuous mode and is
  held open until the voice finishes. The grader also scores the transcript with the voice's echo stripped off, and a
  transcript that is only the echo is ignored.

## Conventions

- **Card keys are stats keys** (`lang:itemId:w` / `lang:itemId:sN`, N = index in `sentences`). Never reorder or
  delete existing sentences or rename item ids: that silently reassigns learners' progress. Append new sentences.
- Content must be what a native speaker would actually say. Add natural alternatives to `accept` and common learner
  mistakes to `unnatural` with a one-line note. Mandarin needs `romanization` (pinyin with tone marks).
- Gendered Polish forms (e.g. `zmęczony`/`zmęczona`, `byłem`/`byłam`) go in `accept`.
- Add a test in `grader.test.ts` or `deck.test.ts` when changing grading or deck logic.
- Settings are merged over `DEFAULT_SETTINGS`, so new settings need a default there; don't rename existing keys.
- The Web Speech API behaves differently per browser (Chrome, Safari/iOS); keep fallbacks (typing, safety timeouts).
  `speak()` prefers on-device voices, waits a beat after `cancel()`, and retries with the default voice if no audio
  starts (Chrome on macOS can fail silently with online voices). Settings has a "Test voice" button.
- Keep the UI fast: few taps, short auto-advance, keyboard shortcuts on desktop.
