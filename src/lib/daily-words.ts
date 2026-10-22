import "server-only";
import { cacheTag } from "next/cache";
import defaults from "@/content/daily-words.json";
import { wordSlug, type DailyWord } from "./daily";
import { supabaseAdmin } from "./supabase";

// The daily words. Until the first edit in /admin/words this is daily-words.json; after that the whole list is
// saved in Supabase (site_settings, key "daily_words") and validated again on every read.

export const WORDS_TAG = "daily-words";
export const MIN_WORDS = 7;
export const MAX_WORDS = 400;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Throws with a message in Portuguese (shown in the admin form).
export function validateWord(input: Partial<Record<keyof DailyWord, unknown>>, n = 0): DailyWord {
  const where = n ? `Palavra ${n}: ` : "";
  const message = (Array.isArray(input.message) ? input.message : [])
    .map((p) => text(p, 800).replace(/\s+/g, " "))
    .filter(Boolean);
  const w = {
    ref: text(input.ref, 60).replace(/\s+/g, " "),
    verse: text(input.verse, 700).replace(/\s+/g, " "),
    title: text(input.title, 90).replace(/\s+/g, " "),
    message,
    prayer: text(input.prayer, 500).replace(/\s+/g, " "),
  };
  if (!/^(?:[1-3] )?[A-Z][A-Za-z]+(?: of [A-Z][a-z]+)? \d+:\d+(?:[–-]\d+)?$/.test(w.ref)) {
    throw new Error(`${where}a referência precisa ser como "Psalm 46:10" ou "Lamentations 3:22–23".`);
  }
  if (!w.verse || !w.title || !w.prayer) throw new Error(`${where}preencha versículo, título e oração.`);
  if (message.length < 1 || message.length > 3) throw new Error(`${where}a mensagem precisa ter de 1 a 3 parágrafos.`);
  return w;
}

export function validateWords(list: unknown): DailyWord[] {
  if (!Array.isArray(list)) throw new Error("Lista inválida.");
  const words = list.map((w, i) => validateWord(w ?? {}, i + 1));
  if (words.length < MIN_WORDS) throw new Error(`Deixe pelo menos ${MIN_WORDS} palavras.`);
  if (words.length > MAX_WORDS) throw new Error(`No máximo ${MAX_WORDS} palavras.`);
  const seen = new Set<string>();
  for (const w of words) {
    if (seen.has(wordSlug(w))) throw new Error(`A referência ${w.ref} aparece duas vezes.`);
    seen.add(wordSlug(w));
  }
  return words;
}

export const DEFAULT_WORDS: DailyWord[] = defaults;

export async function getDailyWords(): Promise<DailyWord[]> {
  "use cache";
  cacheTag(WORDS_TAG);
  return loadWords();
}

async function loadWords(): Promise<DailyWord[]> {
  const db = supabaseAdmin();
  if (!db) return DEFAULT_WORDS;
  const { data, error } = await db.from("site_settings").select("value").eq("key", "daily_words").maybeSingle();
  if (error || !data) return DEFAULT_WORDS;
  try {
    return validateWords(data.value);
  } catch (e) {
    console.error("[daily words] saved list is invalid, using defaults:", e);
    return DEFAULT_WORDS;
  }
}

// Cached per slug for the same reason as getPost() in content.ts: a word added after the build needs a fresh read.
export async function getWordPage(slug: string) {
  "use cache";
  cacheTag(WORDS_TAG);
  const words = await loadWords();
  const i = words.findIndex((w) => wordSlug(w) === slug);
  if (i < 0) return null;
  return { word: words[i], prev: words[(i + words.length - 1) % words.length], next: words[(i + 1) % words.length] };
}
