import { useEffect } from "react";
import { isAccepted } from "../lib/grader";
import type { LanguageConfig } from "../lib/languages/types";
import { playFinish } from "../lib/sounds";
import { CHARACTERS, speak } from "../lib/speech";
import type { Card } from "../lib/types";
import { Mascot } from "./Mascot";
import type { SessionResult } from "./SessionView";

export function Summary({
  lang,
  result,
  isNewBest,
  onAgain,
  onPractice,
  onHome,
}: {
  lang: LanguageConfig;
  result: SessionResult;
  isNewBest: boolean;
  onAgain: () => void;
  onPractice: (cards: Card[]) => void;
  onHome: () => void;
}) {
  useEffect(() => playFinish(), []);
  const total = result.log.length;
  const good = result.log.filter((l) => isAccepted(l.verdict)).length;
  const pct = total ? Math.round((good / total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  const missed = result.log.filter((l) => !isAccepted(l.verdict));
  const smoother = result.log.filter((l) => l.verdict === "unnatural");

  return (
    <div className="summary">
      <Mascot mood={stars >= 2 ? "cheer" : stars === 1 ? "happy" : "meh"} size={120} say={isNewBest ? "New best!" : "Session done!"} />
      <div className="stars">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < stars ? "on" : ""} style={{ animationDelay: `${i * 0.15}s` }}>
            ★
          </span>
        ))}
      </div>
      <div className="stat-row">
        <div className="stat">
          <b>{result.score}</b>
          <span>points</span>
        </div>
        <div className="stat">
          <b>{pct}%</b>
          <span>first-try</span>
        </div>
        <div className="stat">
          <b>🔥{result.bestStreak}</b>
          <span>best streak</span>
        </div>
      </div>

      {missed.length > 0 && (
        <section className="review-list">
          <h2>To revisit</h2>
          {missed.map((l, i) => (
            <ReviewRow key={i} lang={lang} card={l.card} heard={l.heard} />
          ))}
        </section>
      )}
      {smoother.length > 0 && (
        <section className="review-list">
          <h2>Say it smoother</h2>
          {smoother.map((l, i) => (
            <ReviewRow key={i} lang={lang} card={l.card} heard={l.heard} />
          ))}
        </section>
      )}

      <div className="home-actions">
        {missed.length > 0 && (
          <button className="btn primary" onClick={() => onPractice(missed.map((m) => m.card))}>
            🎯 Practice the {missed.length} missed
          </button>
        )}
        <button className={`btn ${missed.length ? "" : "primary"}`} onClick={onAgain}>
          ▶ New session
        </button>
        <button className="btn ghost" onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  );
}

export function ReviewRow({ lang, card, heard, extra }: { lang: LanguageConfig; card: Card; heard?: string; extra?: string }) {
  return (
    <div className="review-row">
      <button className="icon-btn" onClick={() => void speak(card.phrase.text, lang.speechTag, CHARACTERS[0])} aria-label="Play">
        🔊
      </button>
      <div>
        <div lang={lang.speechTag} className="rr-text">
          {card.phrase.text}
        </div>
        {lang.hasRomanization && card.phrase.romanization && <div className="rr-roman">{card.phrase.romanization}</div>}
        <div className="rr-trans">{card.phrase.translation}</div>
        {heard && <div className="rr-heard">you said: “{heard}”</div>}
        {extra && <div className="rr-heard">{extra}</div>}
      </div>
    </div>
  );
}
