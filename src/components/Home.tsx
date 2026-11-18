import { LANGUAGES } from "../lib/languages";
import type { LanguageConfig } from "../lib/languages/types";
import { INTERESTS, LEVEL_INFO } from "../lib/profile";
import { hasVoiceFor } from "../lib/speech";
import type { Settings } from "../lib/storage";
import { LEVELS } from "../lib/types";
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
  onEditProfile,
}: {
  lang: LanguageConfig;
  settings: Settings;
  troubleCount: number;
  best: number;
  update: (patch: Partial<Settings>) => void;
  onStart: () => void;
  onTrouble: () => void;
  onSettings: () => void;
  onEditProfile: () => void;
}) {
  const selected = settings.topics[lang.code] ?? [];
  const toggleTopic = (id: string) => {
    const next = selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id];
    update({ topics: { ...settings.topics, [lang.code]: next } });
  };
  const liked = INTERESTS.filter((i) => settings.interests.includes(i.id));
  const tuned = selected.length === 0 && lang.topics.some((t) => t.interests.some((i) => settings.interests.includes(i)));
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
        <h2>Level</h2>
        <div className="chips">
          {LEVELS.map((l) => (
            <button key={l} className={`chip ${settings.level === l ? "active" : ""}`} onClick={() => update({ level: l })}>
              {LEVEL_INFO[l].emoji} {LEVEL_INFO[l].label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Mode</h2>
        <div className="chips">
          <button className={`chip ${settings.practiceMode === "translate" ? "active" : ""}`} onClick={() => update({ practiceMode: "translate" })}>
            🧠 Translate
          </button>
          <button className={`chip ${settings.practiceMode === "repeat" ? "active" : ""}`} onClick={() => update({ practiceMode: "repeat" })}>
            🦜 Repeat
          </button>
        </div>
        <p className="muted small">
          {settings.practiceMode === "translate"
            ? `See the meaning, say it in ${lang.name}. New words are shown first.`
            : "Hear the phrase, say it back."}
        </p>
      </section>

      <section>
        <h2>
          Topics <small>{selected.length === 0 ? (tuned ? "· all, your interests first" : "· all") : `· ${selected.length} picked`}</small>
        </h2>
        <div className="chips">
          {lang.topics.map((t) => (
            <button key={t.id} className={`chip ${selected.includes(t.id) ? "active" : ""}`} onClick={() => toggleTopic(t.id)}>
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
        <button className="link-btn" onClick={onEditProfile}>
          {liked.length ? `Interests: ${liked.map((i) => i.emoji).join(" ")} · edit` : "Tell us your interests →"}
        </button>
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
      <p className="kbd-hint">Keyboard: Space = talk / next · ← back · → next/skip · H = hint · R = replay · S = skip · T = type</p>
    </div>
  );
}
