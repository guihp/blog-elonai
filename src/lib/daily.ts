import words from "@/content/daily-words.json";

export type DailyWord = (typeof words)[number];

export const dailyWords: DailyWord[] = words;

// "Lamentations 3:22–23" -> "lamentations-3-22-23". Each word also has its own page at /today/<slug>.
export const wordSlug = (w: DailyWord) => w.ref.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const wordBySlug = (slug: string) => dailyWords.find((w) => wordSlug(w) === slug);

const pad = (n: number) => String(n).padStart(2, "0");

// The visitor's local calendar date, e.g. "2026-10-21". Everyone sees the same word on the same date.
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Walks through daily-words.json one entry per day; add entries to the JSON to lengthen the cycle.
export function wordFor(key: string): DailyWord {
  const [y, m, d] = key.split("-").map(Number);
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return words[day % words.length];
}

export function dateLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export async function shareWord(word: DailyWord, url: string) {
  const text = `“${word.verse}” (${word.ref})\n\n${word.title}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Today’s Word · Elonai", text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "cancelled";
  }
}
