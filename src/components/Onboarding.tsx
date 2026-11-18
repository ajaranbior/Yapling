import { useState } from "react";
import { getLanguage, LANGUAGES } from "../lib/languages";
import { INTERESTS, LEVEL_INFO } from "../lib/profile";
import { levelFor, type Settings } from "../lib/storage";
import { LEVELS, type Level } from "../lib/types";
import { Mascot } from "./Mascot";

export type OnboardingStep = "lang" | "level" | "interests";

/**
 * Quick, skippable setup: which language, your level in it, then interests.
 * Shown on first launch. Reopened from Home to edit interests, or at the level step
 * when you switch to a language you haven't set a level for yet (`only` = that one step).
 */
export function Onboarding({
  settings,
  start = "lang",
  only = false,
  onDone,
}: {
  settings: Settings;
  start?: OnboardingStep;
  only?: boolean;
  onDone: (patch: Partial<Settings>) => void;
}) {
  const [step, setStep] = useState<OnboardingStep>(start);
  const [lang, setLang] = useState(settings.lang);
  const [level, setLevel] = useState<Level>(levelFor(settings, settings.lang));
  const [interests, setInterests] = useState<string[]>(settings.interests);

  const toggle = (id: string) => setInterests((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const levelsWith = (l: Level) => ({ ...settings.levels, [lang]: l });
  const finish = (patch: Partial<Settings>) => onDone({ lang, ...patch, onboarded: true });
  const langName = getLanguage(lang).name;

  const steps: OnboardingStep[] = only ? [start] : ["lang", "level", "interests"];
  const say = step === "lang" ? "What do you want to speak?" : step === "level" ? `How's your ${langName}?` : "What do you want to talk about?";
  const blurb =
    step === "lang"
      ? "A few quick questions so what you practise fits you. You can skip, and change it anytime."
      : step === "level"
        ? `Your level is kept per language. Whatever the level, new words and sentences are always shown to you first — you hear them and repeat them before you're asked to say them yourself.`
        : "Pick as many as you like. Sentences from these topics come first.";

  const skip = () => {
    if (step === "lang") finish({});
    else if (step === "level") finish(only ? { levels: levelsWith(level) } : {});
    else finish({ levels: levelsWith(level) });
  };

  return (
    <div className="onboarding">
      <header className="home-top">
        <div className="brand small">{only ? `${langName} level` : "Quick setup"}</div>
        <button className="btn ghost small-btn" onClick={skip}>
          {only ? "Keep beginner" : "Skip"}
        </button>
      </header>

      <div className="hero">
        <Mascot mood="happy" size={90} say={say} />
      </div>
      <p className="muted center">{blurb}</p>
      {steps.length > 1 && (
        <div className="step-dots" aria-hidden>
          {steps.map((s) => (
            <span key={s} className={step === s ? "on" : ""} />
          ))}
        </div>
      )}

      {step === "lang" && (
        <div className="level-list">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`level-btn ${lang === l.code ? "active" : ""}`}
              onClick={() => {
                setLang(l.code);
                setLevel(levelFor(settings, l.code));
                setStep("level");
              }}
            >
              <span className="flag">{l.flag}</span>
              <span>
                <b>{l.name}</b>
                <small>{l.nativeName}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      {step === "level" && (
        <>
          <div className="level-list">
            {LEVELS.map((l) => (
              <button
                key={l}
                className={`level-btn ${level === l ? "active" : ""}`}
                onClick={() => {
                  setLevel(l);
                  if (only) finish({ levels: levelsWith(l) });
                  else setStep("interests");
                }}
              >
                <span className="flag">{LEVEL_INFO[l].emoji}</span>
                <span>
                  <b>{LEVEL_INFO[l].label}</b>
                  <small>{LEVEL_INFO[l].blurb}</small>
                </span>
              </button>
            ))}
          </div>
          {!only && (
            <div className="home-actions">
              <button className="btn ghost" onClick={() => setStep("lang")}>
                ← Back
              </button>
            </div>
          )}
        </>
      )}

      {step === "interests" && (
        <>
          <div className="chips">
            {INTERESTS.map((i) => (
              <button key={i.id} className={`chip ${interests.includes(i.id) ? "active" : ""}`} onClick={() => toggle(i.id)}>
                {i.emoji} {i.label}
              </button>
            ))}
          </div>
          <div className="home-actions">
            <button className="btn primary huge" onClick={() => finish(only ? { interests } : { levels: levelsWith(level), interests })}>
              Let's yap!
            </button>
            {!only && (
              <button className="btn ghost" onClick={() => setStep("level")}>
                ← Back
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
