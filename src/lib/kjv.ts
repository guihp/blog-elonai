import "server-only";

// Checks Bible quotations against the King James Version (bible-api.com), with the same rules as
// build/check_verses.py: case, punctuation and curly quotes are ignored, and "…" joins two excerpts.

const words = (text: string) =>
  text
    .replace(/<[^>]+>/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/'s /g, "s ")
    .replace(/[^a-z0-9' ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");

export async function kjvText(ref: string): Promise<string | null> {
  const key = ref.replace(/[–—]/g, "-").trim();
  try {
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(key)}?translation=kjv`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    return data.text?.replace(/\s+/g, " ").trim() ?? null;
  } catch {
    return null;
  }
}

export const quoteMatches = (quote: string, source: string) => {
  const s = words(source);
  return quote.replace(/\.\.\./g, "…").split("…").every((part) => s.includes(words(part)));
};

export type VerseCheck = { ref: string; quote: string; ok: boolean; kjv: string | null };

export async function checkVerse(ref: string, quote: string): Promise<VerseCheck> {
  const kjv = await kjvText(ref);
  return { ref, quote, kjv, ok: kjv !== null && quoteMatches(quote, kjv) };
}

// Every “quote” (Book 1:2) in a post body, plus numbered items like **1. Psalm 4:8.** “quote”.
const REF = String.raw`((?:[1-3] )?[A-Z][a-z]+(?: of [A-Z][a-z]+)? \d+:\d+(?:[–-]\d+)?)`;
export async function checkPostQuotes(body: string): Promise<VerseCheck[]> {
  const found: [string, string][] = [];
  for (const m of body.matchAll(new RegExp(String.raw`“([^”]{12,})”\s*\(` + REF + String.raw`\)`, "g"))) found.push([m[2], m[1]]);
  for (const m of body.matchAll(new RegExp(String.raw`\*\*\d+\. ` + REF + String.raw`\.\*\* “([^”]+)”`, "g"))) found.push([m[1], m[2]]);
  return Promise.all(found.slice(0, 40).map(([ref, quote]) => checkVerse(ref, quote)));
}
