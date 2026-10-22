// Helpers shared by the server and the browser. The list itself comes from getDailyWords() (lib/daily-words.ts):
// daily-words.json by default, or the version edited in /admin/words.

export type DailyWord = { ref: string; verse: string; title: string; message: string[]; prayer: string };

// "Lamentations 3:22–23" -> "lamentations-3-22-23". Each word also has its own page at /today/<slug>.
export const wordSlug = (w: Pick<DailyWord, "ref">) => w.ref.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const pad = (n: number) => String(n).padStart(2, "0");

// The visitor's local calendar date, e.g. "2026-10-21". Everyone sees the same word on the same date.
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const isDateKey = (key: string) => /^\d{4}-\d{2}-\d{2}$/.test(key);

// Walks through the list one entry per day; adding words lengthens the cycle.
export function wordFor(words: DailyWord[], key: string): DailyWord {
  const [y, m, d] = key.split("-").map(Number);
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return words[day % words.length];
}

// Browser side: asks the server for the word of the visitor's local date.
export async function fetchWord(key: string): Promise<DailyWord | null> {
  try {
    const res = await fetch(`/api/word?d=${key}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
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
