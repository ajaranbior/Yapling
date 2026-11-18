import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gradeLocally, isAccepted, isOnlyEcho, maskWords, POINTS, stripEcho } from "../lib/grader";
import type { LanguageConfig } from "../lib/languages/types";
import { playMicOff, playMicOn, playStreak, playVerdict } from "../lib/sounds";
import { asrSupported, CHARACTERS, estimateSpeechMs, listen, speak, stopSpeaking, type Character, type Listening } from "../lib/speech";
import type { Settings } from "../lib/storage";
import type { Card, GradeResult, Verdict } from "../lib/types";
import { Highlight } from "./Highlight";
import { Mascot, type Mood } from "./Mascot";

export interface LogEntry {
  card: Card;
  verdict: Verdict;
  heard: string;
}

export interface SessionResult {
  score: number;
  bestStreak: number;
  log: LogEntry[];
}

type Phase = "intro" | "answer" | "listening" | "checking" | "feedback";

const RANK: Verdict[] = ["perfect", "alternative", "unnatural", "close", "wrong", "skipped", "dunno"];

const VERDICT_UI: Record<Verdict, { emoji: string; title: string; mood: Mood }> = {
  perfect: { emoji: "🎯", title: "Perfect!", mood: "cheer" },
  alternative: { emoji: "✅", title: "Nice — that works too!", mood: "happy" },
  unnatural: { emoji: "👌", title: "Understood! Smoother way:", mood: "happy" },
  close: { emoji: "🤏", title: "So close!", mood: "meh" },
  wrong: { emoji: "💪", title: "Good try!", mood: "sad" },
  skipped: { emoji: "⏭", title: "Skipped", mood: "idle" },
  dunno: { emoji: "🤷", title: "No worries — here it is", mood: "happy" },
};

/** How long accepted answers stay on screen before moving on (after the answer audio, in translate mode). */
const ADVANCE_MS: Partial<Record<Verdict, number>> = { perfect: 650, alternative: 1500, unnatural: 2600 };

/** Points multiplier when you used a hint (1) or revealed the answer (2). */
const HINT_MULT = [1, 0.6, 0.3];

/** Phrases shorter than this (spoken ms) are too short to talk over: the mic opens after the voice. */
const EARLY_MIC_MIN_MS = 1300;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function SessionView({
  lang,
  deck,
  settings,
  onAttempt,
  onFinish,
  onExit,
}: {
  lang: LanguageConfig;
  deck: Card[];
  settings: Settings;
  onAttempt: (card: Card, verdict: Verdict) => void;
  onFinish: (r: SessionResult) => void;
  onExit: () => void;
}) {
  const [queue, setQueue] = useState<Card[]>(deck);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [showTranslation, setShowTranslation] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [gained, setGained] = useState<{ id: number; pts: number } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [interim, setInterim] = useState("");
  const [typing, setTyping] = useState(!asrSupported());
  const [typed, setTyped] = useState("");
  const [peek, setPeek] = useState(false);
  const [hint, setHint] = useState(0); // 0 = none, 1 = first letters, 2 = answer revealed
  const [notice, setNotice] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  /** Bumps when the current card is replayed in place (after "Dunno"). */
  const [rev, setRev] = useState(0);

  const log = useRef<LogEntry[]>([]);
  const attempts = useRef(0);
  const run = useRef(0); // bumps on every card change so stale async work is ignored
  const listening = useRef<Listening | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stayed = useRef(false);
  const requeued = useRef(new Set<string>());
  const logged = useRef(new Set<string>()); // first attempt per card counts for stats

  const card = queue[index];
  const mode = card.mode ?? "recall";
  /** Recall: you see the meaning and say it yourself. Learn/echo cards are played first and said back. */
  const prompted = mode === "recall";
  const revealed = !prompted || hint >= 2 || phase === "feedback";
  const autoMic = settings.autoMic && !typing && asrSupported();

  const speaker: Character = useMemo(() => {
    // Rotate through characters, never the same one twice in a row.
    const offset = (index * 3 + card.itemId.length) % CHARACTERS.length;
    return CHARACTERS[offset];
  }, [index, card.itemId]);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setAutoAdvance(null);
  };

  const stopAll = useCallback(() => {
    clearTimer();
    stopSpeaking();
    listening.current?.abort();
    listening.current = null;
  }, []);

  useEffect(() => stopAll, [stopAll]);

  // Timers fire after re-renders, so read the latest values through a ref.
  const latest = useRef({ queue, index, score, bestStreak });
  latest.current = { queue, index, score, bestStreak };

  const next = useCallback(() => {
    stopAll();
    const { queue: q, index: i, score: sc, bestStreak: bs } = latest.current;
    if (i + 1 >= q.length) return onFinish({ score: sc, bestStreak: bs, log: log.current });
    setIndex(i + 1);
  }, [stopAll, onFinish]);

  const back = useCallback(() => {
    const i = latest.current.index;
    if (i === 0) return;
    stopAll();
    setIndex(i - 1);
  }, [stopAll]);

  const playPhrase = useCallback(
    async (rate = 1, onHalf?: () => void) => {
      setSpeaking(true);
      await speak(card.phrase.text, lang.speechTag, speaker, { rate: settings.speechRate * rate, onHalf });
      setSpeaking(false);
    },
    [card, lang, speaker, settings.speechRate],
  );

  // ------------------------------------------------------------- grading

  const finalize = useCallback(
    (r: GradeResult) => {
      const myRun = run.current;
      const first = attempts.current === 0;
      attempts.current += 1;
      const accepted = isAccepted(r.verdict);
      const pts = first ? Math.ceil(POINTS[r.verdict] * HINT_MULT[prompted ? hint : 0]) : Math.ceil(POINTS[r.verdict] / 2);

      setResult(r);
      setPhase("feedback");
      setScore((s) => s + pts);
      setGained({ id: Date.now(), pts });
      const newStreak = accepted ? streak + 1 : 0;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      playVerdict(r.verdict, newStreak);
      if (accepted && newStreak > 0 && newStreak % 5 === 0) setTimeout(playStreak, 350);

      if (first && !logged.current.has(card.key)) {
        logged.current.add(card.key);
        // Peeking at the answer means it isn't really known yet: keep it in trouble spots.
        const statVerdict: Verdict = prompted && hint >= 2 && accepted ? "close" : r.verdict;
        log.current.push({ card, verdict: statVerdict, heard: r.heard });
        onAttempt(card, statVerdict);
        // Missed it? It comes back a few cards later in this session.
        if (!isAccepted(statVerdict) && !requeued.current.has(card.key)) {
          requeued.current.add(card.key);
          setQueue((q) => {
            const copy = [...q];
            copy.splice(Math.min(index + 4, copy.length), 0, card);
            return copy;
          });
        }
      }

      const wait = ADVANCE_MS[r.verdict];
      const scheduleAdvance = () => {
        if (!wait || run.current !== myRun || stayed.current) return;
        setAutoAdvance(wait);
        timer.current = setTimeout(() => {
          if (run.current === myRun) next();
        }, wait);
      };
      // In translate mode, let them hear how it's said (unless they nailed it — keep the pace up).
      if (prompted && r.verdict !== "perfect") {
        void (async () => {
          await sleep(250);
          if (run.current !== myRun) return;
          await playPhrase();
          scheduleAdvance();
        })();
      } else scheduleAdvance();
    },
    [card, index, streak, hint, prompted, onAttempt, next, playPhrase],
  );

  const evaluate = useCallback(
    async (raw: string[], overlapped: boolean) => {
      const myRun = run.current;
      let alternatives = raw.filter((a) => a.trim());
      if (alternatives.length === 0) {
        setNotice("Didn't catch that — tap the mic and try again.");
        setPhase("answer");
        return;
      }
      // Mic was open while the voice talked: also grade the transcript with the voice's echo cut off.
      if (overlapped) alternatives = [...alternatives, ...alternatives.flatMap((a) => stripEcho(lang, a, card.phrase.text))];

      // Recognisers return several guesses; grade them all and keep the kindest.
      const graded = alternatives.map((a) => gradeLocally(lang, a, card.phrase, { kind: card.kind }));
      let best = graded.sort((a, b) => RANK.indexOf(a.verdict) - RANK.indexOf(b.verdict))[0];

      if (settings.aiEnabled && settings.aiKey && best.verdict !== "perfect") {
        setPhase("checking");
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 9000);
        try {
          const { gradeWithAi } = await import("../lib/aiGrader");
          const mode = prompted ? "translate" : "repeat";
          const ai = await gradeWithAi({ apiKey: settings.aiKey, model: settings.aiModel }, lang, card.phrase, best.heard, mode, ctrl.signal);
          best = { ...best, ...ai, source: "ai" };
        } catch (err) {
          console.warn("AI grading failed, using local grade", err);
        } finally {
          clearTimeout(t);
        }
      }
      if (run.current !== myRun) return;
      finalize(best);
    },
    [lang, card, settings, prompted, finalize],
  );

  /**
   * `overlap`: the voice is still talking. Listen continuously and hold the turn open until
   * the voice is done (the caller calls `release()`), so you can start speaking early.
   */
  const startListening = useCallback(
    async (opts: { overlap?: boolean } = {}) => {
      if (!asrSupported()) return setTyping(true);
      const overlap = !!opts.overlap;
      const myRun = run.current;
      listening.current?.abort();
      if (!overlap) stopSpeaking();
      setNotice(null);
      setInterim("");
      setPhase("listening");
      if (!overlap) playMicOn(); // a beep mid-sentence would only confuse the recogniser
      const l = listen(lang.speechTag, { onInterim: setInterim, continuous: overlap, hold: overlap });
      listening.current = l;
      try {
        const alts = await l.result;
        if (run.current !== myRun || listening.current !== l) return;
        listening.current = null;
        // Only the tail of the voice was heard: the learner hasn't answered yet, so keep listening.
        if (overlap && alts.length > 0 && alts.every((a) => isOnlyEcho(lang, a, card.phrase.text))) {
          void startListening();
          return;
        }
        playMicOff();
        await evaluate(alts, overlap);
      } catch (err) {
        if (run.current !== myRun) return;
        listening.current = null;
        const msg = String((err as Error).message);
        if (msg.includes("not-allowed") || msg.includes("service-not-allowed")) {
          setNotice("Microphone blocked — allow mic access, or type your answer.");
          setTyping(true);
        } else {
          setNotice(`Mic hiccup (${msg}). Try again or type.`);
        }
        setPhase("answer");
      }
    },
    [lang, card, evaluate],
  );

  const stopListening = () => listening.current?.stop();

  // ------------------------------------------------------------- per card

  useEffect(() => {
    const myRun = ++run.current;
    attempts.current = 0;
    stayed.current = false;
    setResult(null);
    setPhase("intro");
    setShowTranslation(false);
    setInterim("");
    setTyped("");
    setPeek(false);
    setHint(0);
    setNotice(null);
    (async () => {
      if (prompted) {
        // Nothing to listen to first: straight to your turn.
        setShowTranslation(true);
        setPhase("answer");
        if (autoMic) {
          await sleep(120);
          if (run.current === myRun) void startListening();
        }
        return;
      }
      const early = autoMic && settings.earlyMic && estimateSpeechMs(card.phrase.text) >= EARLY_MIC_MIN_MS;
      let opened = false;
      await playPhrase(
        1,
        early
          ? () => {
              if (run.current !== myRun) return;
              opened = true;
              void startListening({ overlap: true });
            }
          : undefined,
      );
      if (run.current !== myRun) return;
      setShowTranslation(true);
      if (opened) {
        listening.current?.release();
        return;
      }
      setPhase("answer");
      if (autoMic) void startListening();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, rev]);

  /** Replay the phrase (stops the mic first so it doesn't hear the voice), then listen again. */
  const replay = async (rate = 1) => {
    const myRun = run.current;
    const wasAnswering = phase === "answer" || phase === "listening" || phase === "intro";
    listening.current?.abort();
    listening.current = null;
    if (wasAnswering) setPhase("answer");
    await playPhrase(rate);
    if (run.current === myRun && wasAnswering && autoMic) void startListening();
  };

  const showHint = () => {
    if (hint === 0) setHint(1);
    else {
      setHint(2);
      void replay();
    }
  };

  const skip = () => {
    stopAll();
    if (attempts.current === 0 && !logged.current.has(card.key)) {
      logged.current.add(card.key);
      log.current.push({ card, verdict: "skipped", heard: "" });
      onAttempt(card, "skipped");
    }
    playVerdict("skipped");
    next();
  };

  /**
   * "I don't know": drops the card back to be re-introduced, shows it right now (again, for a
   * new card), and brings it back later in the session. Also logged when the card was already
   * answered this session, so the stage really goes back to 0.
   */
  const dunno = () => {
    stopAll();
    const entry = log.current.find((l) => l.card.key === card.key);
    if (entry) entry.verdict = "dunno";
    else log.current.push({ card, verdict: "dunno", heard: "" });
    if (!logged.current.has(card.key) || entry?.verdict !== "dunno" || true) onAttempt(card, "dunno");
    logged.current.add(card.key);
    attempts.current = 0;
    setStreak(0);
    playVerdict("dunno");
    setQueue((q) => {
      const copy = [...q];
      copy[index] = { ...card, mode: "learn" };
      if (!requeued.current.has(card.key)) {
        requeued.current.add(card.key);
        copy.splice(Math.min(index + 4, copy.length), 0, { ...card, mode: "echo" });
      }
      return copy;
    });
    setRev((r) => r + 1);
  };

  const stay = () => {
    stayed.current = true;
    clearTimer();
  };

  const retry = () => {
    clearTimer();
    stopSpeaking();
    setResult(null);
    setHint(2); // they've seen the answer now
    setPhase("answer");
    if (!typing) void startListening();
  };

  const submitTyped = () => {
    if (!typed.trim()) return;
    listening.current?.abort();
    listening.current = null;
    void evaluate([typed], false);
  };

  // ------------------------------------------------------------- keyboard

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = (e.target as HTMLElement)?.tagName === "INPUT";
      if (e.key === "Escape") return onExit();
      if (inInput) return;
      const k = e.key.toLowerCase();
      if (e.key === " ") {
        e.preventDefault();
        if (phase === "listening") stopListening();
        else if (phase === "answer" || phase === "intro") void startListening();
        else if (phase === "feedback") next();
      } else if (e.key === "Enter") {
        if (phase === "feedback") next();
      } else if (e.key === "ArrowLeft") back();
      else if (e.key === "ArrowRight") phase === "feedback" ? next() : skip();
      else if (k === "r") void replay();
      else if (k === "h" && prompted && !revealed) showHint();
      else if (k === "s") skip();
      else if (k === "d" && phase !== "checking" && !(phase === "feedback" && accepted)) dunno();
      else if (k === "t") setTyping((t) => !t);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ------------------------------------------------------------- render

  const progress = (index + (phase === "feedback" ? 1 : 0)) / queue.length;
  const ui = result ? VERDICT_UI[result.verdict] : null;
  const mood: Mood =
    phase === "listening" ? "listening" : phase === "checking" ? "thinking" : ui ? ui.mood : speaking ? "happy" : "idle";
  // Echo: hear it and say it back without reading it (tap to peek).
  const hideText = mode === "echo" && phase !== "feedback" && !peek;
  const accepted = result && isAccepted(result.verdict);
  const hintText = lang.hasRomanization && card.phrase.romanization ? maskWords(card.phrase.romanization) : maskWords(card.phrase.text);
  const kindLabel =
    mode === "learn" ? (card.kind === "word" ? "✨ New word" : "✨ New sentence") : mode === "echo" ? "🦜 Say it back" : "🧠 Say it";

  const onCardTap = () => {
    if (prompted && !revealed) showHint();
    else if (hideText) setPeek(true);
    else void replay();
  };

  return (
    <div className="session">
      <header className="session-top">
        <button className="icon-btn" onClick={onExit} aria-label="Exit session">
          ✕
        </button>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="score" key={score}>
          {streak >= 3 && <span className="streak">🔥{streak}</span>}
          <span className="score-num">{score}</span>
          {gained && gained.pts > 0 && (
            <span key={gained.id} className="score-pop">
              +{gained.pts}
            </span>
          )}
        </div>
      </header>

      <main className="stage">
        <div className="speaker-row">
          <div className={`speaker ${speaking ? "talking" : ""}`} style={{ background: speaker.color }}>
            <span>{speaker.emoji}</span>
          </div>
          <div className="speaker-meta">
            <div className="speaker-name">{speaker.name}</div>
            <div className={`card-kind ${card.kind}`}>{kindLabel}</div>
          </div>
          <Mascot mood={mood} size={64} />
        </div>

        <button key={index} className={`phrase-card ${hideText ? "hidden-text" : ""}`} onClick={onCardTap}>
          {!revealed ? (
            <>
              <div className="prompt-label">Say it in {lang.name}</div>
              <div className="phrase-text prompt">{card.phrase.translation}</div>
              {card.kind === "sentence" && card.focusWord && (
                <div className="focus-chip">
                  uses <b lang={lang.speechTag}>{card.focusWord}</b>
                </div>
              )}
              {hint === 1 ? (
                <div className="masked" lang={lang.speechTag}>
                  {hintText}
                </div>
              ) : (
                <div className="peek-hint">tap for a hint</div>
              )}
            </>
          ) : (
            <>
              <div className="phrase-text" lang={lang.speechTag}>
                {card.kind === "sentence" ? <Highlight text={card.phrase.text} focus={card.focusWord} lang={lang} /> : card.phrase.text}
              </div>
              {lang.hasRomanization && card.phrase.romanization && <div className="phrase-roman">{card.phrase.romanization}</div>}
              <div className={`phrase-translation ${showTranslation || prompted ? "shown" : ""}`}>{card.phrase.translation}</div>
              {hideText && <div className="peek-hint">tap to peek</div>}
            </>
          )}
        </button>

        {phase !== "feedback" && (
          <div className="answer-zone">
            {phase === "intro" && <div className="hint">{mode === "learn" ? "New! Listen…" : "Listen…"}</div>}
            {phase === "answer" && <div className="hint">{mode === "recall" ? "Your turn — say it!" : "Your turn — repeat it!"}</div>}
            {phase === "listening" && <div className="hint">{speaking ? "Listening — jump in whenever you're ready" : mode === "recall" ? "Listening… say it!" : "Listening… repeat it!"}</div>}
            {phase === "checking" && <div className="hint">Checking…</div>}
            {interim && !speaking && <div className="interim">“{interim}”</div>}
            {notice && <div className="notice">{notice}</div>}

            {typing ? (
              <form
                className="type-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitTyped();
                }}
              >
                <input
                  autoFocus
                  lang={lang.speechTag}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={`Type in ${lang.name}…`}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button type="submit" className="btn primary" disabled={!typed.trim() || phase === "checking"}>
                  ✓
                </button>
              </form>
            ) : (
              <button
                className={`mic ${phase === "listening" ? "on" : ""}`}
                onClick={() => (phase === "listening" ? stopListening() : void startListening())}
                disabled={phase === "checking"}
                aria-label={phase === "listening" ? "Stop listening" : "Start speaking"}
              >
                {phase === "checking" ? <span className="spinner" /> : "🎙️"}
              </button>
            )}
            {phase !== "checking" && (
              <button className="btn ghost dunno-btn" onClick={dunno} aria-label="I don't know this">
                🤷 Dunno
              </button>
            )}
          </div>
        )}

        {phase === "feedback" && result && ui && (
          <div className={`feedback v-${result.verdict}`} onClick={() => accepted && next()}>
            <div className="fb-head">
              <span className="fb-emoji">{ui.emoji}</span>
              <span className="fb-title">{ui.title}</span>
              {prompted && hint > 0 && <span className="badge hint-badge">{hint === 1 ? "hint" : "peeked"}</span>}
              {result.source === "ai" && <span className="badge">AI</span>}
            </div>
            {result.heard && (
              <div className="fb-line">
                <span className="fb-label">You said</span>
                <span lang={lang.speechTag}>{result.heard}</span>
              </div>
            )}

            {result.verdict === "unnatural" && (
              <div className="fb-line big">
                <span className="fb-label">Natives say</span>
                <span lang={lang.speechTag}>{result.better ?? result.expected}</span>
              </div>
            )}
            {result.verdict === "alternative" && (
              <div className="fb-line">
                <span className="fb-label">Expected</span>
                <span lang={lang.speechTag}>{result.expected}</span>
              </div>
            )}
            {(result.verdict === "close" || result.verdict === "wrong") && (
              <>
                <div className="fb-line big">
                  <span className="fb-label">Target</span>
                  <span lang={lang.speechTag} className="marks">
                    {result.marks?.map((m, i) => (
                      <span key={i} className={m.hit ? "" : "miss"}>
                        {m.token}
                        {lang.tokenJoiner}
                      </span>
                    )) ?? result.expected}
                  </span>
                </div>
                {result.better && result.better !== result.expected && (
                  <div className="fb-line">
                    <span className="fb-label">Your version, fixed</span>
                    <span lang={lang.speechTag}>{result.better}</span>
                  </div>
                )}
              </>
            )}
            {result.note && <div className="fb-note">{result.note}</div>}

            {autoAdvance ? <div className="auto-bar" style={{ animationDuration: `${autoAdvance}ms` }} /> : null}

            <div className="fb-actions" onClick={(e) => e.stopPropagation()}>
              {!accepted && (
                <button className="btn" onClick={retry}>
                  ↻ Try again
                </button>
              )}
              {!accepted && result.verdict !== "dunno" && (
                <button className="btn ghost" onClick={dunno}>
                  🤷 Dunno
                </button>
              )}
              {accepted && !stayed.current && ADVANCE_MS[result.verdict] && (
                <button className="btn ghost" onClick={stay}>
                  ⏸ Stay
                </button>
              )}
              <button className="btn primary" onClick={next}>
                Next ⏎
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="tools">
        <button className="tool" onClick={back} disabled={index === 0} aria-label="Previous card">
          ◀<span>Back</span>
        </button>
        {!revealed ? (
          <>
            <button className="tool" onClick={showHint} aria-label="Hint">
              💡<span>{hint === 0 ? "Hint" : "Show"}</span>
            </button>
            <button
              className="tool"
              onClick={() => {
                setHint(2);
                void replay();
              }}
              aria-label="Hear the answer"
            >
              🔊<span>Hear it</span>
            </button>
          </>
        ) : (
          <>
            <button className="tool" onClick={() => void replay()} aria-label="Replay">
              🔊<span>Replay</span>
            </button>
            <button className="tool" onClick={() => void replay(0.65)} aria-label="Replay slowly">
              🐢<span>Slow</span>
            </button>
          </>
        )}
        <button className="tool" onClick={() => setTyping((t) => !t)} aria-label="Toggle typing">
          {typing ? "🎙️" : "⌨️"}
          <span>{typing ? "Speak" : "Type"}</span>
        </button>
        <button className="tool" onClick={skip} aria-label="Skip">
          ⏭<span>Skip</span>
        </button>
      </footer>
    </div>
  );
}
