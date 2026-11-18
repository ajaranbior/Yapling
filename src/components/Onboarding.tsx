import { useState } from "react";
import { INTERESTS, LEVEL_INFO } from "../lib/profile";
import type { Settings } from "../lib/storage";
import { LEVELS, type Level } from "../lib/types";
import { Mascot } from "./Mascot";

/**
 * Two quick, skippable questions (level, then interests) used to tailor the sentences.
 * Shown once on first launch; can be reopened from Home.
 */
export function Onboarding({
  settings,
  onDone,
}: {
  settings: Settings;
  onDone: (patch: Partial<Settings>) => void;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const [level, setLevel] = useState<Level>(settings.level);
  const [interests, setInterests] = useState<string[]>(settings.interests);

  const toggle = (id: string) => setInterests((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const finish = (patch: Partial<Settings>) => onDone({ ...patch, onboarded: true });

  return (
    <div className="onboarding">
      <header className="home-top">
        <div className="brand small">Quick setup</div>
        <button className="btn ghost small-btn" onClick={() => finish(step === 0 ? {} : { level })}>
          Skip
        </button>
      </header>

      <div className="hero">
        <Mascot mood="happy" size={90} say={step === 0 ? "How's your level?" : "What do you want to talk about?"} />
      </div>
      <p className="muted center">
        {step === 0
          ? "We ask two quick questions so the sentences you practise match your level and what you care about. You can skip, and change this anytime."
          : "Pick as many as you like. Sentences from these topics come first."}
      </p>
      <div className="step-dots" aria-hidden>
        <span className={step === 0 ? "on" : ""} />
        <span className={step === 1 ? "on" : ""} />
      </div>

      {step === 0 ? (
        <div className="level-list">
          {LEVELS.map((l) => (
            <button
              key={l}
              className={`level-btn ${level === l ? "active" : ""}`}
              onClick={() => {
                setLevel(l);
                setStep(1);
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
      ) : (
        <>
          <div className="chips">
            {INTERESTS.map((i) => (
              <button key={i.id} className={`chip ${interests.includes(i.id) ? "active" : ""}`} onClick={() => toggle(i.id)}>
                {i.emoji} {i.label}
              </button>
            ))}
          </div>
          <div className="home-actions">
            <button className="btn primary huge" onClick={() => finish({ level, interests })}>
              Let's yap!
            </button>
            <button className="btn ghost" onClick={() => setStep(0)}>
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
