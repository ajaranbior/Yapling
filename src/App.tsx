import { useCallback, useEffect, useState } from "react";
import { Home } from "./components/Home";
import { Onboarding } from "./components/Onboarding";
import { SessionView, type SessionResult } from "./components/SessionView";
import { SettingsSheet } from "./components/SettingsSheet";
import { Summary } from "./components/Summary";
import { Trouble } from "./components/Trouble";
import { buildLearnDeck } from "./lib/deck";
import { getLanguage } from "./lib/languages";
import { setSoundEnabled, unlockAudio } from "./lib/sounds";
import { primeTts } from "./lib/speech";
import {
  loadBest,
  loadSettings,
  loadStats,
  recordAttempt,
  saveBest,
  saveSettings,
  saveStats,
  troubleList,
  type Settings,
  type Stats,
} from "./lib/storage";
import type { Card, Verdict } from "./lib/types";

type Screen =
  | { name: "home" }
  | { name: "onboarding" }
  | { name: "trouble" }
  | { name: "session"; deck: Card[]; id: number }
  | { name: "summary"; result: SessionResult; isNewBest: boolean };

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [best, setBest] = useState<Record<string, number>>(loadBest);
  const [screen, setScreen] = useState<Screen>(() => (settings.onboarded ? { name: "home" } : { name: "onboarding" }));
  const [showSettings, setShowSettings] = useState(false);

  const lang = getLanguage(settings.lang);

  useEffect(() => {
    saveSettings(settings);
    setSoundEnabled(settings.sound);
  }, [settings]);
  useEffect(() => saveStats(stats), [stats]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);

  const startDeck = (deck: Card[]) => {
    if (!deck.length) return;
    unlockAudio();
    primeTts();
    setScreen({ name: "session", deck, id: Date.now() });
  };

  const startLearn = () =>
    startDeck(
      buildLearnDeck(
        lang,
        { topicIds: settings.topics[lang.code] ?? [], size: settings.sessionSize, level: settings.level, interests: settings.interests },
        stats,
      ),
    );

  const onAttempt = useCallback(
    (card: Card, verdict: Verdict) => setStats((s) => recordAttempt(s, lang.code, card, verdict)),
    [lang.code],
  );

  const onFinish = useCallback(
    (result: SessionResult) => {
      const prev = best[lang.code] ?? 0;
      const isNewBest = result.score > prev && result.log.length >= 5;
      if (isNewBest) {
        const b = { ...best, [lang.code]: result.score };
        setBest(b);
        saveBest(b);
      }
      setScreen({ name: "summary", result, isNewBest });
    },
    [best, lang.code],
  );

  return (
    <div className="app">
      {screen.name === "onboarding" && (
        <Onboarding
          settings={settings}
          onDone={(patch) => {
            update(patch);
            setScreen({ name: "home" });
          }}
        />
      )}
      {screen.name === "home" && (
        <Home
          lang={lang}
          settings={settings}
          troubleCount={troubleList(stats, lang.code).length}
          best={best[lang.code] ?? 0}
          update={update}
          onStart={startLearn}
          onTrouble={() => setScreen({ name: "trouble" })}
          onEditProfile={() => setScreen({ name: "onboarding" })}
          onSettings={() => setShowSettings(true)}
        />
      )}
      {screen.name === "trouble" && (
        <Trouble lang={lang} stats={stats} size={settings.sessionSize} onPractice={startDeck} onBack={() => setScreen({ name: "home" })} />
      )}
      {screen.name === "session" && (
        <SessionView
          key={screen.id}
          lang={lang}
          deck={screen.deck}
          settings={settings}
          onAttempt={onAttempt}
          onFinish={onFinish}
          onExit={() => setScreen({ name: "home" })}
        />
      )}
      {screen.name === "summary" && (
        <Summary
          lang={lang}
          result={screen.result}
          isNewBest={screen.isNewBest}
          onAgain={startLearn}
          onPractice={startDeck}
          onHome={() => setScreen({ name: "home" })}
        />
      )}
      {showSettings && (
        <SettingsSheet
          settings={settings}
          update={update}
          onResetStats={() => {
            setStats({});
            setBest({});
            saveBest({});
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
