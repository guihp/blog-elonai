import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/admin-guard";
import { books } from "@/lib/content";
import { KIND_LABEL, listSubscribers } from "@/lib/subscribers";
import AdminNav from "../AdminNav";
import ConfirmButton from "../ConfirmButton";
import { deleteSubscriber } from "./actions";

export const metadata: Metadata = { title: "Inscritos", robots: { index: false, follow: false } };

const when = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const bookTitle = (slug: string | null) => books.find((b) => b.slug === slug)?.title ?? slug ?? "";

export default function SubscribersPage({ searchParams }: PageProps<"/admin/subscribers">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Subscribers searchParams={searchParams} />
    </Suspense>
  );
}

async function Subscribers({ searchParams }: { searchParams: PageProps<"/admin/subscribers">["searchParams"] }) {
  await requireAdminPage();
  const sp = await searchParams;
  const kind = typeof sp.kind === "string" && KIND_LABEL[sp.kind] ? sp.kind : "";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const rows = await listSubscribers({ kind, q });
  const qs = new URLSearchParams({ ...(kind && { kind }), ...(q && { q }) }).toString();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-8">
      <AdminNav current="/admin/subscribers" title="Inscritos">
        <a href={`/api/admin/subscribers${qs ? `?${qs}` : ""}`} className="btn btn-ink !py-2.5">Baixar CSV</a>
      </AdminNav>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <nav className="flex border border-line bg-white text-sm">
          {[["", "Todos"], ...Object.entries(KIND_LABEL)].map(([k, label]) => (
            <Link key={k} href={`/admin/subscribers${k ? `?kind=${k}` : ""}`} className={`px-4 py-2 ${k === kind ? "bg-ink text-paper" : "hover:bg-linen"}`}>{label}</Link>
          ))}
        </nav>
        <form className="flex gap-2" action="/admin/subscribers">
          {kind && <input type="hidden" name="kind" value={kind} />}
          <input name="q" defaultValue={q} placeholder="Buscar email ou nome" className="field !bg-white !py-2" />
          <button className="border border-line bg-white px-4 text-sm hover:bg-linen">Buscar</button>
        </form>
        <p className="text-sm text-muted">{rows.length} {rows.length === 1 ? "pessoa" : "pessoas"}</p>
      </div>

      <p className="mt-4 text-xs text-muted">
        O CSV abre no Excel e no Google Planilhas e pode ser importado no MailerLite. Só quem baixou um livro com “email reminders” marcado aceitou receber emails.
      </p>

      <div className="mt-4 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-linen text-xs uppercase tracking-wider text-muted">
            <tr>
              {["Data", "Tipo", "Nome", "Email", "Estado", "Livro", "Aceita emails", "Como conheceu", "Tema", "Idade", ""].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-3 py-2 text-muted">{when(r.created_at)}</td>
                <td className="px-3 py-2">{KIND_LABEL[r.kind] ?? r.kind}</td>
                <td className="px-3 py-2">{r.first_name}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{r.state}</td>
                <td className="px-3 py-2">{bookTitle(r.book)}</td>
                <td className="px-3 py-2">{r.kind === "download" ? (r.email_reminders ? "Sim" : "Não") : "Sim"}</td>
                <td className="px-3 py-2">{r.heard_from}</td>
                <td className="px-3 py-2">{r.heart_topic}</td>
                <td className="px-3 py-2">{r.age_range}</td>
                <td className="px-3 py-2 text-right">
                  <form action={deleteSubscriber}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message={`Apagar ${r.email} para sempre?`} className="text-xs text-red-700 hover:underline">Apagar</ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={11} className="px-3 py-10 text-center text-muted">Ninguém por aqui ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
