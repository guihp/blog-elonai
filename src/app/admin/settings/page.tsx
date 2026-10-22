import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { COOKIE, totpEnabled, verifySession } from "@/lib/admin-auth";
import { recentAudit, type AuditRow } from "@/lib/audit";
import { displayUrl } from "@/lib/donation";
import { donateOptions } from "@/lib/qr";
import { getSettings, MAX_DONATIONS, SOCIAL_HOSTS } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const metadata: Metadata = { title: "Configurações", robots: { index: false, follow: false } };

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Settings />
    </Suspense>
  );
}

const ACTIONS: Record<string, string> = {
  login: "Entrou no painel",
  "login.failed": "Tentativa de login errada",
  "settings.update": "Alterou as configurações",
  "settings.denied": "Código errado ao salvar",
};

const FIELD_LABEL: Record<string, string> = {
  donation_methods: "doações",
  community_url: "link da comunidade",
  contact_email: "email",
  socials: "redes sociais",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

function describe(row: AuditRow) {
  if (row.action !== "settings.update" || !row.detail) return null;
  const parts = Object.entries(row.detail).map(([k, v]) => {
    if (k !== "donation_methods") return FIELD_LABEL[k] ?? k;
    const { before, after } = v as { before: { url: string }[]; after: { url: string }[] };
    return `doações: ${before.map((m) => displayUrl(m.url)).join(", ")} → ${after.map((m) => displayUrl(m.url)).join(", ")}`;
  });
  return parts.join(" · ");
}

async function Settings() {
  if (!verifySession((await cookies()).get(COOKIE)?.value)) redirect("/admin/login");
  const [settings, options, log] = await Promise.all([getSettings(), donateOptions(), recentAudit()]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Painel Elonai</p>
          <h1 className="mt-2 text-5xl">Configurações</h1>
        </div>
        <nav className="flex border border-line bg-white text-sm">
          <Link href="/admin" className="px-4 py-2 hover:bg-linen">Visitas</Link>
          <span className="bg-ink px-4 py-2 text-paper">Configurações</span>
        </nav>
      </div>

      <section className="mt-8 border border-line bg-white p-6">
        <h2 className="text-2xl">Como está no site agora</h2>
        <p className="mt-1 text-sm text-muted">Escaneie cada QR code com o celular e confira se abre a sua página de doação.</p>
        <div className="mt-5 flex flex-wrap gap-6">
          {options.map((o) => (
            <div key={o.url} className="w-40 text-center">
              <div className="mx-auto h-32 w-32 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: o.qr }} />
              <p className="mt-2 font-medium">{o.label}</p>
              <p className="break-all text-xs text-muted">{displayUrl(o.url)}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 border-l-2 border-gold pl-3 text-xs text-ink-soft">
          Os PDFs dos livros já baixados guardam o link antigo. Se trocar o link principal, me peça para gerar os PDFs de
          novo.
        </p>
      </section>

      <div className="mt-8">
        <SettingsForm settings={settings} socialNames={Object.keys(SOCIAL_HOSTS)} maxDonations={MAX_DONATIONS} withCode={totpEnabled()} />
      </div>

      <section className="mt-8 border border-line bg-white p-6">
        <h2 className="text-2xl">Atividade de segurança</h2>
        <p className="mt-1 text-sm text-muted">
          As últimas entradas no painel e alterações. Se aparecer algo que não foi você, troque a senha na hora.
        </p>
        {log.length ? (
          <ul className="mt-4 divide-y divide-line text-sm">
            {log.map((r, i) => (
              <li key={i} className="flex flex-wrap gap-x-4 gap-y-1 py-2.5">
                <span className="w-32 shrink-0 text-muted">{when(r.created_at)}</span>
                <span className={r.action.endsWith("failed") || r.action.endsWith("denied") ? "text-red-700" : ""}>{ACTIONS[r.action] ?? r.action}</span>
                {describe(r) && <span className="text-muted">{describe(r)}</span>}
                <span className="ml-auto text-xs text-muted">{r.ip}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Nada registrado ainda.</p>
        )}
      </section>
    </div>
  );
}
