"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/admin-guard";
import { clientIp } from "@/lib/analytics";
import { audit } from "@/lib/audit";
import { wordSlug, type DailyWord } from "@/lib/daily";
import { getDailyWords, validateWord, validateWords, WORDS_TAG } from "@/lib/daily-words";
import { checkVerse } from "@/lib/kjv";
import { supabaseAdmin } from "@/lib/supabase";

export type WordState = { ok: boolean; message: string; kjv?: string | null };

async function saveList(words: DailyWord[]) {
  const db = supabaseAdmin();
  if (!db) throw new Error("O Supabase não está configurado.");
  const list = validateWords(words);
  const { error } = await db.from("site_settings").upsert({ key: "daily_words", value: list, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Não foi possível salvar: ${error.message}`);
  updateTag(WORDS_TAG);
}

export async function saveWord(_: WordState, form: FormData): Promise<WordState> {
  await requireAdminAction();
  const original = String(form.get("original") ?? "");
  let word: DailyWord;
  try {
    word = validateWord({
      ref: form.get("ref"),
      verse: form.get("verse"),
      title: form.get("title"),
      message: String(form.get("message") ?? "").replace(/\r\n/g, "\n").split(/\n\s*\n/),
      prayer: form.get("prayer"),
    });
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }

  // The verse must match the King James Version, unless "save anyway" is ticked.
  const check = await checkVerse(word.ref, word.verse);
  if (!check.ok && form.get("force") !== "on") {
    return {
      ok: false,
      kjv: check.kjv,
      message: check.kjv
        ? "O versículo não confere com a KJV. Compare abaixo, corrija ou marque “salvar mesmo assim”."
        : "Não consegui buscar essa referência na KJV. Confira se está escrita certo (ex.: Psalm 46:10) ou marque “salvar mesmo assim”.",
    };
  }

  const words = [...(await getDailyWords())];
  const at = words.findIndex((w) => wordSlug(w) === original);
  if (wordSlug(word) !== original && words.some((w) => wordSlug(w) === wordSlug(word))) {
    return { ok: false, message: `Já existe uma palavra com ${word.ref}.` };
  }
  if (at >= 0) words[at] = word;
  else words.push(word);

  try {
    await saveList(words);
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  await audit(at >= 0 ? "word.update" : "word.create", clientIp(await headers()), { ref: word.ref });
  if (wordSlug(word) !== original) redirect(`/admin/words/${wordSlug(word)}?saved=1`);
  return { ok: true, message: "Salvo. Já está no site." };
}

export async function deleteWord(form: FormData) {
  await requireAdminAction();
  const slug = String(form.get("slug") ?? "");
  const words = (await getDailyWords()).filter((w) => wordSlug(w) !== slug);
  await saveList(words);
  await audit("word.delete", clientIp(await headers()), { slug });
  redirect("/admin/words");
}
