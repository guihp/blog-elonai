import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/admin-guard";
import { todayKey, wordFor, wordSlug } from "@/lib/daily";
import { getDailyWords } from "@/lib/daily-words";
import AdminNav from "../AdminNav";

export const metadata: Metadata = { title: "Palavras diárias", robots: { index: false, follow: false } };

export default function WordsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Words />
    </Suspense>
  );
}

async function Words() {
  await requireAdminPage();
  const words = await getDailyWords();
  const today = wordFor(words, todayKey());

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-8">
      <AdminNav current="/admin/words" title="Palavras diárias">
        <Link href="/admin/words/new" className="btn btn-ink !py-2.5">Nova palavra</Link>
      </AdminNav>
      <p className="mt-6 text-sm text-muted">
        {words.length} palavras. O site mostra uma por dia, em ordem, e recomeça no fim. Hoje: <b>{today.title}</b> ({today.ref}).
        Uma palavra nova entra no fim da fila.
      </p>
      <ol className="mt-4 divide-y divide-line border border-line bg-white">
        {words.map((w, i) => (
          <li key={w.ref}>
            <Link href={`/admin/words/${wordSlug(w)}`} className={`flex items-baseline justify-between gap-4 px-5 py-3 hover:bg-linen ${w === today ? "bg-linen" : ""}`}>
              <span>
                <span className="mr-3 text-xs text-muted">{i + 1}</span>
                <span className="font-serif text-lg">{w.title}</span>
              </span>
              <span className="shrink-0 text-xs text-muted">{w.ref}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
