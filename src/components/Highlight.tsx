import { stripDiacritics } from "../lib/grader";
import type { LanguageConfig } from "../lib/languages/types";

const fold = (s: string) => stripDiacritics(s.toLowerCase()).replace(/[^\p{L}\p{N}]/gu, "");

/** Render a sentence with the focus word (or its inflected form) highlighted. */
export function Highlight({ text, focus, lang }: { text: string; focus?: string; lang: LanguageConfig }) {
  if (!focus) return <>{text}</>;
  if (lang.tokenJoiner === "") {
    const i = text.indexOf(focus);
    if (i === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, i)}
        <mark>{focus}</mark>
        {text.slice(i + focus.length)}
      </>
    );
  }
  // Inflecting languages: match on a stem so "kawa" also lights up "kawę".
  const f = fold(focus.split(" ")[0]);
  const stem = f.slice(0, Math.max(3, f.length - 3));
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        /\S/.test(part) && fold(part).startsWith(stem) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
      )}
    </>
  );
}
