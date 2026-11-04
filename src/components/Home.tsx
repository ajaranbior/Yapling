import { LANGUAGES } from "../lib/languages";
import type { LanguageConfig } from "../lib/languages/types";
import { hasVoiceFor } from "../lib/speech";
import type { Settings } from "../lib/storage";
import { Mascot } from "./Mascot";

const SIZES = [8, 12, 20, 30];

export function Home({
  lang,
  settings,
  troubleCount,
  best,
  update,
  onStart,
  onTrouble,
  onSettings,
}: {
  lang: LanguageConfig;
  settings: Settings;
  troubleCount: number;
  best: number;
  update: (patch: Partial<Settings>) => void;
  onStart: () => void;
  onTrouble: () => void;
  onSettings: () => void;
}) {
  const selected = settings.topics[lang.code] ?? [];
  const toggleTopic = (id: string) => {
    const next = selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id];
    update({ topics: { ...settings.topics, [lang.code]: next } });
  };
  const noVoice = typeof window !== "undefined" && "speechSynthesis" in window && !hasVoiceFor(lang.speechTag);

  return (
    <div className="home">
      <header className="home-top">
        <div className="brand">Yapling</div>
        <button className="icon-btn" onClick={onSettings} aria-label="Settings">
          ⚙️
        </button>
      </header>

      <div className="hero">
        <Mascot mood="happy" size={110} say={best ? `Best: ${best} pts. Beat it?` : "Let's yap!"} />
      </div>

      <section>
        <h2>Language</h2>
        <div className="lang-row">
          {LANGUAGES.map((l) => (
            <button key={l.code} className={`lang-btn ${l.code === lang.code ? "active" : ""}`} onClick={() => update({ lang: l.code })}>
              <span className="flag">{l.flag}</span>
              <span>{l.name}</span>
              <small>{l.nativeName}</small>
            </button>
          ))}
        </div>
        {noVoice && <p className="warn">No {lang.name} voice found on this device — install one in your system's text-to-speech settings for audio.</p>}
      </section>

      <section>
        <h2>
          Topics <small>{selected.length === 0 ? "· all" : `· ${selected.length} picked`}</small>
        </h2>
        <div className="chips">
          {lang.topics.map((t) => (
            <button key={t.id} className={`chip ${selected.includes(t.id) ? "active" : ""}`} onClick={() => toggleTopic(t.id)}>
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Session length</h2>
        <div className="chips">
          {SIZES.map((n) => (
            <button key={n} className={`chip ${settings.sessionSize === n ? "active" : ""}`} onClick={() => update({ sessionSize: n })}>
              {n} cards
            </button>
          ))}
        </div>
      </section>

      <div className="home-actions">
        <button className="btn primary huge" onClick={onStart}>
          ▶ Start
        </button>
        <button className="btn" onClick={onTrouble} disabled={troubleCount === 0}>
          🎯 Trouble spots {troubleCount > 0 && <span className="pill">{troubleCount}</span>}
        </button>
      </div>
      <p className="kbd-hint">Keyboard: Space = talk / next · R = replay · S = skip · T = type</p>
    </div>
  );
}
