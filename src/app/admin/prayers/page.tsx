import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/admin-guard";
import { books } from "@/lib/content";
import { supabaseAdmin } from "@/lib/supabase";
import type { Subscriber } from "@/lib/subscribers";
import AdminNav from "../AdminNav";
import { setPrayed } from "./actions";

export const metadata: Metadata = { title: "Pedidos de oração", robots: { index: false, follow: false } };

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default function PrayersPage({ searchParams }: PageProps<"/admin/prayers">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Prayers searchParams={searchParams} />
    </Suspense>
  );
}

async function Prayers({ searchParams }: { searchParams: PageProps<"/admin/prayers">["searchParams"] }) {
  await requireAdminPage();
  const done = (await searchParams).show === "prayed";
  const db = supabaseAdmin();
  let rows: Subscriber[] = [];
  let pending = 0;
  if (db) {
    const { data } = await db.from("subscribers").select("*").not("prayer_request", "is", null).order("created_at", { ascending: false }).limit(3000);
    const all = ((data ?? []) as Subscriber[]).filter((r) => r.prayer_request?.trim());
    pending = all.filter((r) => !r.prayed_at).length;
    rows = done ? all.filter((r) => r.prayed_at) : all.filter((r) => !r.prayed_at).reverse();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-8">
      <AdminNav current="/admin/prayers" title="Pedidos de oração">
        <nav className="flex border border-line bg-white text-sm">
          <Link href="/admin/prayers" className={`px-4 py-2 ${!done ? "bg-ink text-paper" : "hover:bg-linen"}`}>Esperando oração ({pending})</Link>
          <Link href="/admin/prayers?show=prayed" className={`px-4 py-2 ${done ? "bg-ink text-paper" : "hover:bg-linen"}`}>Já orados</Link>
        </nav>
      </AdminNav>

      <p className="mt-6 text-sm text-muted">
        {done ? "Os mais recentes primeiro." : "Os mais antigos primeiro, para ninguém ficar esperando."} Só compartilhe no grupo os pedidos
        marcados com “pode compartilhar”, e só com o primeiro nome.
      </p>

      <ul className="mt-6 space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="border border-line bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-serif text-2xl">
                {r.first_name || "Sem nome"}
                {r.state && <span className="ml-2 text-base text-muted">· {r.state}</span>}
              </p>
              <p className="text-xs text-muted">
                {when(r.created_at)}
                {r.book && ` · ${books.find((b) => b.slug === r.book)?.title ?? r.book}`}
              </p>
            </div>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{r.prayer_request}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className={`text-xs ${r.share_request ? "text-sage" : "text-muted"}`}>
                {r.share_request ? "✓ Pode compartilhar no grupo (só o primeiro nome)" : "Pedido particular: não compartilhar"}
              </span>
              <form action={setPrayed}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="prayed" value={done ? "0" : "1"} />
                <button className={done ? "text-sm text-muted underline" : "btn btn-gold !py-2"}>
                  {done ? `Orado em ${when(r.prayed_at!)} · desfazer` : "Orei por este pedido"}
                </button>
              </form>
            </div>
          </li>
        ))}
        {!rows.length && (
          <li className="border border-line bg-white p-10 text-center text-muted">{done ? "Nenhum pedido marcado ainda." : "Nenhum pedido esperando."}</li>
        )}
      </ul>
    </div>
  );
}
