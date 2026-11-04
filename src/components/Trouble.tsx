import { useMemo } from "react";
import { allCards } from "../lib/deck";
import type { LanguageConfig } from "../lib/languages/types";
import { troubleList, type Stats } from "../lib/storage";
import type { Card } from "../lib/types";
import { ReviewRow } from "./Summary";

export function Trouble({
  lang,
  stats,
  size,
  onPractice,
  onBack,
}: {
  lang: LanguageConfig;
  stats: Stats;
  size: number;
  onPractice: (cards: Card[]) => void;
  onBack: () => void;
}) {
  const rows = useMemo(() => {
    const byKey = new Map(allCards(lang).map((c) => [c.key, c]));
    return troubleList(stats, lang.code)
      .map((s) => ({ stat: s, card: byKey.get(s.key) }))
      .filter((r): r is { stat: typeof r.stat; card: Card } => !!r.card);
  }, [lang, stats]);

  return (
    <div className="trouble">
      <header className="home-top">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="brand small">Trouble spots</div>
        <span />
      </header>
      <p className="muted">The words and sentences you miss most, worst first. Getting them right pushes them off the list.</p>
      <button className="btn primary" disabled={!rows.length} onClick={() => onPractice(rows.slice(0, size).map((r) => r.card))}>
        🎯 Practice top {Math.min(size, rows.length)}
      </button>
      <div className="review-list">
        {rows.map(({ stat, card }) => (
          <div key={stat.key} className="trouble-row">
            <div className="meter" title={`${Math.round(stat.trouble * 100)}% trouble`}>
              <div style={{ width: `${Math.round(stat.trouble * 100)}%` }} />
            </div>
            <ReviewRow lang={lang} card={card} extra={`missed ${stat.wrong} of ${stat.seen}`} />
          </div>
        ))}
        {!rows.length && <p className="muted">Nothing here yet — go yap!</p>}
      </div>
    </div>
  );
}
