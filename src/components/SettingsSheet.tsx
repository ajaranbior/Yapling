import { AI_MODELS } from "../lib/aiModels";
import { useState } from "react";
import type { LanguageConfig } from "../lib/languages/types";
import { asrSupported, CHARACTERS, speak, speechLog, ttsSupported, voicesFor } from "../lib/speech";
import type { Settings } from "../lib/storage";

export function SettingsSheet({
  lang,
  settings,
  update,
  onResetStats,
  onClose,
}: {
  lang: LanguageConfig;
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  onResetStats: () => void;
  onClose: () => void;
}) {
  const [voiceInfo, setVoiceInfo] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const testVoice = () => {
    const voices = voicesFor(lang.speechTag);
    setVoiceInfo(
      !ttsSupported()
        ? "This browser can't speak."
        : voices.length
          ? `${lang.name} voices: ${voices.map((v) => `${v.name}${v.localService ? "" : " (online)"}`).join(", ")}`
          : `No ${lang.name} voice installed — the browser will try its default voice.`,
    );
    setLog([...speechLog]);
    const refresh = setInterval(() => setLog([...speechLog]), 300);
    void speak(lang.topics[0].items[0].word.text, lang.speechTag, CHARACTERS[0], { rate: settings.speechRate }).finally(() =>
      setTimeout(() => {
        clearInterval(refresh);
        setLog([...speechLog]);
      }, 300),
    );
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Settings">
        <header className="home-top">
          <div className="brand small">Settings</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <Toggle label="Sounds" checked={settings.sound} onChange={(v) => update({ sound: v })} />
        <Toggle
          label="Start mic automatically"
          hint="Listen right after the phrase is spoken"
          checked={settings.autoMic}
          onChange={(v) => update({ autoMic: v })}
        />
        <Toggle
          label="Talk over the voice"
          hint="Mic opens halfway through the phrase, so you can start early. Turn off if the voice cuts out on your phone."
          checked={settings.earlyMic}
          onChange={(v) => update({ earlyMic: v })}
        />
<label className="field">
          <span>Voice speed · {settings.speechRate.toFixed(2)}×</span>
          <input
            type="range"
            min={0.6}
            max={1.3}
            step={0.05}
            value={settings.speechRate}
            onChange={(e) => update({ speechRate: Number(e.target.value) })}
          />
        </label>
        <button className="btn ghost" onClick={testVoice}>
          🔊 Test {lang.name} voice
        </button>
        {voiceInfo && <p className="muted small">{voiceInfo} No sound? Check your volume / output device, and on a Mac make sure a voice for this language is installed (System Settings → Accessibility → Spoken Content → System voice → Manage Voices).</p>}
        {log.length > 0 && (
          <pre className="speech-log" onClick={() => void navigator.clipboard?.writeText(log.join("\n"))} title="Tap to copy">
            {log.slice(-16).join("\n")}
          </pre>
        )}
        {!asrSupported() && <p className="warn">This browser has no speech recognition — you'll type answers. Chrome, Edge and Safari support speaking.</p>}

        <h2>Smarter feedback (optional)</h2>
        <p className="muted">
          With an Anthropic API key, answers that don't match exactly are checked by Claude: it judges whether your own phrasing is natural
          and suggests a better one. The key is stored only in this browser and sent only to Anthropic's API.
        </p>
        <Toggle label="Use Claude to grade" checked={settings.aiEnabled} onChange={(v) => update({ aiEnabled: v })} />
        <label className="field">
          <span>API key</span>
          <input
            type="password"
            placeholder="sk-ant-…"
            value={settings.aiKey}
            onChange={(e) => update({ aiKey: e.target.value.trim() })}
            autoComplete="off"
          />
        </label>
        <label className="field">
          <span>Model</span>
          <select value={settings.aiModel} onChange={(e) => update({ aiModel: e.target.value })}>
            {AI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <h2>Data</h2>
        <button
          className="btn ghost danger"
          onClick={() => {
            if (confirm("Reset all progress and trouble spots?")) onResetStats();
          }}
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <div>
        <div>{label}</div>
        {hint && <small className="muted">{hint}</small>}
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" />
    </label>
  );
}
