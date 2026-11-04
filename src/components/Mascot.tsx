export type Mood = "idle" | "happy" | "cheer" | "meh" | "sad" | "listening" | "thinking";

/** Yapling — a round little chatterbox. Pure SVG + CSS animation. */
export function Mascot({ mood = "idle", size = 96, say }: { mood?: Mood; size?: number; say?: string }) {
  const eyes = (() => {
    switch (mood) {
      case "happy":
      case "cheer":
        return (
          <>
            <path d="M30 46 q7 -8 14 0" className="m-stroke" />
            <path d="M56 46 q7 -8 14 0" className="m-stroke" />
          </>
        );
      case "sad":
        return (
          <>
            <path d="M31 44 l12 -4" className="m-stroke" />
            <path d="M69 44 l-12 -4" className="m-stroke" />
            <circle cx="37" cy="51" r="4" className="m-pupil" />
            <circle cx="63" cy="51" r="4" className="m-pupil" />
          </>
        );
      case "meh":
        return (
          <>
            <path d="M30 47 h14" className="m-stroke" />
            <path d="M56 47 h14" className="m-stroke" />
          </>
        );
      default:
        return (
          <g className="m-blink">
            <circle cx="37" cy="47" r="9" fill="#fff" />
            <circle cx="63" cy="47" r="9" fill="#fff" />
            <circle cx={mood === "thinking" ? 40 : 38} cy={mood === "thinking" ? 44 : 48} r="4.5" className="m-pupil" />
            <circle cx={mood === "thinking" ? 66 : 64} cy={mood === "thinking" ? 44 : 48} r="4.5" className="m-pupil" />
          </g>
        );
    }
  })();

  const mouth = (() => {
    switch (mood) {
      case "happy":
        return <path d="M40 62 q10 10 20 0" className="m-stroke" />;
      case "cheer":
        return <path d="M38 60 q12 16 24 0 z" fill="#3b0f2e" />;
      case "sad":
        return <path d="M41 68 q9 -7 18 0" className="m-stroke" />;
      case "meh":
        return <path d="M42 65 h16" className="m-stroke" />;
      case "listening":
        return <ellipse cx="50" cy="64" rx="5" ry="6" fill="#3b0f2e" />;
      default:
        return <path d="M43 63 q7 5 14 0" className="m-stroke" />;
    }
  })();

  return (
    <div className={`mascot mood-${mood}`} style={{ width: size }}>
      {say && <div className="mascot-say">{say}</div>}
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        {/* antenna / speech-bubble tuft */}
        <path d="M50 14 q-4 -8 4 -10" className="m-stroke m-tuft" />
        <ellipse cx="50" cy="56" rx="38" ry="36" className="m-body" />
        <ellipse cx="50" cy="66" rx="24" ry="18" className="m-belly" />
        {/* wings */}
        <path d="M13 58 q-9 6 -2 16 q6 -2 8 -8" className="m-wing m-wing-l" />
        <path d="M87 58 q9 6 2 16 q-6 -2 -8 -8" className="m-wing m-wing-r" />
        {/* cheeks */}
        <ellipse cx="27" cy="58" rx="5" ry="3" fill="#f9a8d4" opacity="0.7" />
        <ellipse cx="73" cy="58" rx="5" ry="3" fill="#f9a8d4" opacity="0.7" />
        {eyes}
        {mouth}
        {mood === "cheer" && (
          <g className="m-stars">
            <text x="6" y="22" fontSize="14">✨</text>
            <text x="78" y="18" fontSize="14">⭐</text>
          </g>
        )}
        {mood === "listening" && (
          <g className="m-waves">
            <path d="M88 34 q6 6 0 12" className="m-stroke" />
            <path d="M93 30 q9 10 0 20" className="m-stroke" />
          </g>
        )}
      </svg>
    </div>
  );
}
