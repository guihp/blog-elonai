import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { COOKIE, verifySession } from "@/lib/admin-auth";
import { loadHits, loadSignups, type Hit } from "@/lib/analytics";
import { books, getPosts, site } from "@/lib/content";
import { SURVEY, SURVEY_FIELDS } from "@/lib/survey";
import UtmBuilder from "./UtmBuilder";

export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };

const TZ = "America/Sao_Paulo";
const RANGES = [
  { days: 1, label: "Hoje" },
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
];

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const fmt = (n: number) => n.toLocaleString("pt-BR");
const regionName = new Intl.DisplayNames(["pt-BR"], { type: "region" });
const countryLabel = (c: string | null) => {
  if (!c) return "Desconhecido";
  try {
    return regionName.of(c) ?? c;
  } catch {
    return c;
  }
};

function top<T>(items: T[], key: (t: T) => string | null, limit = 8) {
  const m = new Map<string, number>();
  for (const i of items) {
    const k = key(i);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

// A visit = one browser-tab session; without sessionStorage fall back to the daily visitor hash.
const sid = (h: Hit) => h.session ?? h.visitor;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : 0;
};
const duration = (sec: number) => (sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}min ${String(sec % 60).padStart(2, "0")}s`);
const KIND_LABEL: Record<Hit["kind"], string> = {
  view: "Visita", download: "Download", donate: "Doar", community: "Comunidade", form_open: "Abriu formulário", signup: "Cadastro", read: "Leitura",
};

// One row per visitor-day, so a person who reads 10 pages counts once in "where people are from".
const uniqueVisitors = (hits: Hit[]) => [...new Map(hits.map((h) => [h.visitor, h])).values()];

// Plain async function (not a component), so reading the clock here is fine.
async function getReport(days: number) {
  const today = dayKey(new Date().toISOString());
  const since = new Date(Date.now() - days * 86400_000);
  if (days === 1) since.setTime(new Date(`${today}T00:00:00-03:00`).getTime());

  const [hits, signups] = await Promise.all([loadHits(since), loadSignups(since).catch(() => null)]);
  const views = hits.filter((h) => h.kind === "view");
  const visitors = uniqueVisitors(views);
  const count = (k: Hit["kind"]) => hits.filter((h) => h.kind === k).length;

  // First page of each visit says where it came from. Hits are newest first, so the last write per session wins = oldest.
  const entries = new Map(views.map((h) => [sid(h), h]));
  const firstOfSession = [...entries.values()];

  // Funnel: which visits reached each step. A visit counts once per step however many times it repeats it.
  const reached = (test: (h: Hit) => boolean) => new Set(hits.filter(test).map(sid));
  const bookSlug = (h: Hit) =>
    h.kind === "view" ? h.path.match(/^\/books\/([^/]+)$/)?.[1]
    : h.kind === "form_open" ? h.target
    : h.kind === "signup" ? h.target?.match(/^book:(.+)$/)?.[1]
    : h.kind === "download" ? h.target?.match(/\/books\/([^/]+)\//)?.[1] : undefined;
  const steps = {
    visit: new Set(entries.keys()),
    book: reached((h) => h.kind === "view" && !!bookSlug(h)),
    form: reached((h) => h.kind === "form_open"),
    signup: reached((h) => h.kind === "signup" && !!bookSlug(h)),
    download: reached((h) => h.kind === "download"),
  };
  const funnel = [
    { label: "Visitaram o site", n: steps.visit.size },
    { label: "Abriram a página de um livro", n: steps.book.size },
    { label: "Abriram o formulário", n: steps.form.size },
    { label: "Enviaram o cadastro", n: steps.signup.size },
    { label: "Baixaram o PDF", n: steps.download.size },
  ];

  // Which sources and campaigns bring visits that convert (download), not just traffic.
  const conversionBy = (key: (h: Hit) => string | null) => {
    const m = new Map<string, { visits: number; signups: number; downloads: number }>();
    for (const [id, h] of entries) {
      const k = key(h);
      if (!k) continue;
      const r = m.get(k) ?? { visits: 0, signups: 0, downloads: 0 };
      r.visits++;
      if (steps.signup.has(id)) r.signups++;
      if (steps.download.has(id)) r.downloads++;
      m.set(k, r);
    }
    return [...m.entries()].sort((a, b) => b[1].visits - a[1].visits).slice(0, 10);
  };

  const byBook = books.filter((b) => b.status === "free").map((b) => {
    const at = (kind: Hit["kind"]) => new Set(hits.filter((h) => h.kind === kind && bookSlug(h) === b.slug).map(sid)).size;
    return { title: b.title, visits: at("view"), forms: at("form_open"), signups: at("signup"), downloads: at("download") };
  }).sort((a, b) => b.downloads - a.downloads || b.visits - a.visits);

  // Reading: how long people stay and how far they get, per page (blog posts first).
  const readMap = new Map<string, { n: number; secs: number[]; end: number }>();
  for (const h of hits) {
    if (h.kind !== "read" || h.seconds === null) continue;
    const r = readMap.get(h.path) ?? { n: 0, secs: [], end: 0 };
    r.n++;
    r.secs.push(h.seconds);
    if ((h.depth ?? 0) >= 90) r.end++;
    readMap.set(h.path, r);
  }
  const reading = [...readMap.entries()]
    .map(([path, r]) => ({ path, n: r.n, median: median(r.secs), end: r.end / r.n }))
    .sort((a, b) => Number(b.path.startsWith("/blog/")) - Number(a.path.startsWith("/blog/")) || b.n - a.n)
    .slice(0, 12);

  const series: { day: string; views: number; visitors: number }[] = [];
  for (let i = Math.min(days, 90) - 1; i >= 0; i--) {
    const d = dayKey(new Date(Date.now() - i * 86400_000).toISOString());
    const dv = views.filter((h) => dayKey(h.created_at) === d);
    series.push({ day: d, views: dv.length, visitors: new Set(dv.map((h) => h.visitor)).size });
  }

  const bookTitle = (target: string | null) => books.find((b) => target?.includes(`/books/${b.slug}/`))?.title ?? target;
  return { hits, signups, views, visitors, count, firstOfSession, series, bookTitle, funnel, conversionBy, byBook, reading };
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  // Second lock after proxy.ts: never render data without a valid session.
  if (!verifySession((await cookies()).get(COOKIE)?.value)) redirect("/admin/login");

  const sp = await searchParams;
  const days = RANGES.find((r) => String(r.days) === sp.days)?.days ?? 30;
  const { hits, signups, views, visitors, count, firstOfSession, series, bookTitle, funnel, conversionBy, byBook, reading } = await getReport(days);
  const local = !process.env.SUPABASE_URL;
  const posts = await getPosts();
  const pageLabel = (path: string) => posts.find((p) => `/blog/${p.slug}` === path)?.title ?? (path === "/" ? "Página inicial" : path);
  const targetLabel = (t: string | null) => books.find((b) => t?.includes(`/books/${b.slug}/`) || t === b.slug || t?.endsWith(`:${b.slug}`))?.title ?? t;
  const linkPages = [
    { path: "/", label: "Página inicial" },
    { path: "/books", label: "Todos os livros" },
    ...books.filter((b) => b.status === "free").map((b) => ({ path: `/books/${b.slug}`, label: `Livro · ${b.title}` })),
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, label: `Post · ${p.title}` })),
    { path: "/today", label: "Palavra do dia" },
    { path: "/community", label: "Comunidade" },
  ];
  const convRows = (rows: ReturnType<typeof conversionBy>) =>
    rows.map(([k, r]) => [k, fmt(r.visits), fmt(r.signups), fmt(r.downloads), pct(r.downloads, r.visits)]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Painel Elonai</p>
          <h1 className="mt-2 text-5xl">Visitas e acessos</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex border border-line bg-white text-sm" aria-label="Período">
            {RANGES.map((r) => (
              <Link key={r.days} href={`/admin?days=${r.days}`} className={`px-4 py-2 ${r.days === days ? "bg-ink text-paper" : "hover:bg-linen"}`}>{r.label}</Link>
            ))}
          </nav>
          <Link href="/admin/settings" className="border border-line bg-white px-4 py-2 text-sm hover:bg-linen">Configurações</Link>
          <form action="/api/admin/logout" method="post">
            <button className="border border-line bg-white px-4 py-2 text-sm hover:bg-linen">Sair</button>
          </form>
        </div>
      </div>

      {local && (
        <p className="mt-6 border-l-2 border-gold bg-linen px-4 py-3 text-sm text-ink-soft">
          Modo local: os acessos estão sendo salvos em <code>web/.data/analytics.ndjson</code>. Depois de conectar o Supabase, eles ficam salvos no banco e a localização (país, estado, cidade) aparece quando o site estiver no ar.
        </p>
      )}

      <section className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4 lg:grid-cols-7">
        <Stat label="Visitantes" value={visitors.length} hint="pessoas únicas por dia" />
        <Stat label="Páginas vistas" value={views.length} />
        <Stat label="Visitas" value={firstOfSession.length} hint="sessões" />
        <Stat label="Downloads de PDF" value={count("download")} />
        <Stat label="Conversão" text={pct(funnel[4].n, funnel[0].n)} hint="visitas que baixaram" />
        <Stat label="Cliques em doar" value={count("donate")} />
        <Stat label="Cadastros" value={signups?.length ?? null} hint={signups ? "formulários enviados" : "conecte o Supabase"} />
      </section>

      <section className="mt-8 border border-line bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl">Páginas vistas por dia</h2>
          <p className="text-sm text-muted">Passe o mouse sobre uma barra para ver o dia · horário de Brasília</p>
        </div>
        <DailyBars series={series} />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Ranked title="Páginas mais acessadas" unit="visualizações" rows={top(views, (h) => h.path, 10)} />
        <Ranked title="De onde vieram" unit="visitas" rows={top(firstOfSession, (h) => h.source, 10)}
          note="Facebook, Google, Instagram… “Direct” = digitou o endereço, link salvo ou app de mensagem." />
        <Ranked title="Países" unit="visitantes" rows={top(visitors, (h) => countryLabel(h.country), 10)} />
        <Ranked title="Estados / regiões" unit="visitantes" rows={top(visitors, (h) => (h.region ? `${h.region}${h.country ? ` · ${h.country}` : ""}` : null), 10)} />
        <Ranked title="Cidades" unit="visitantes" rows={top(visitors, (h) => h.city, 10)} />
        <Ranked title="Aparelhos" unit="visitantes" rows={top(visitors, (h) => `${h.device} · ${h.os}`, 8)} />
        <Ranked title="Livros baixados" unit="downloads" rows={top(hits.filter((h) => h.kind === "download"), (h) => bookTitle(h.target), 8)} />
        {signups ? (
          <Ranked title="Cadastros por tipo" unit="cadastros" rows={top(signups, (s) => (s.book ? `${s.kind} · ${s.book}` : s.kind), 8)} />
        ) : (
          <Ranked title="Navegadores" unit="visitantes" rows={top(visitors, (h) => h.browser, 8)} />
        )}
      </div>

      <section className="mt-8 border border-line bg-white p-6">
        <h2 className="text-2xl">Funil de conversão</h2>
        <p className="mt-1 text-sm text-muted">Quantas visitas chegaram a cada etapa. A porcentagem à direita compara com a etapa anterior: o maior “vazamento” é onde vale melhorar.</p>
        <Funnel steps={funnel} />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Table title="Conversão por origem" head={["Origem", "Visitas", "Cadastros", "Downloads", "Conversão"]} rows={convRows(conversionBy((h) => h.source))}
          note="Conversão = visitas que baixaram um PDF. Mostra quais redes trazem leitores de verdade, não só cliques." />
        <Table title="Campanhas (UTM)" head={["Campanha", "Visitas", "Cadastros", "Downloads", "Conversão"]} rows={convRows(conversionBy((h) => h.campaign))}
          note="Aparece quando o link tem utm_campaign. Crie os links no gerador abaixo." />
      </div>

      <section className="mt-8">
        <Table title="Desempenho por livro" head={["Livro", "Viram a página", "Abriram formulário", "Cadastraram", "Baixaram", "Conversão"]}
          rows={byBook.map((b) => [b.title, fmt(b.visits), fmt(b.forms), fmt(b.signups), fmt(b.downloads), pct(b.downloads, b.visits)])} />
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-3xl">Pesquisa com leitores</h2>
          <p className="text-sm text-muted">Perguntas opcionais do formulário de download</p>
        </div>
        {signups ? (
          <div className="mt-4 grid gap-8 lg:grid-cols-3">
            {SURVEY_FIELDS.map((k) => {
              const answered = signups.filter((s) => s[k]);
              return (
                <Ranked key={k} title={SURVEY[k].admin} unit="respostas" rows={top(answered, (s) => s[k], 10)}
                  note={`${fmt(answered.length)} de ${fmt(signups.filter((s) => s.kind === "download").length)} downloads responderam`} />
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Conecte o Supabase para ver as respostas.</p>
        )}
      </section>

      <section className="mt-8">
        <Table title="Leitura das páginas" head={["Página", "Leituras", "Tempo típico", "Leram até o fim"]}
          rows={reading.map((r) => [pageLabel(r.path), fmt(r.n), duration(r.median), pct(r.end * 100, 100)])}
          note="Tempo típico = mediana, só com a aba aberta na tela. “Até o fim” = rolaram 90% ou mais do texto." />
      </section>

      <UtmBuilder siteUrl={site.site_url} pages={linkPages} />

      <section className="mt-8 border border-line bg-white p-6">
        <h2 className="text-2xl">Atividade recente</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[0.68rem] uppercase tracking-[0.16em] text-gold-dark">
              <tr className="border-b border-gold-light"><th className="py-2 pr-4 font-medium">Quando</th><th className="pr-4 font-medium">O quê</th><th className="pr-4 font-medium">Página</th><th className="pr-4 font-medium">Origem</th><th className="pr-4 font-medium">Local</th><th className="font-medium">Aparelho</th></tr>
            </thead>
            <tbody>
              {hits.filter((h) => h.kind !== "read").slice(0, 30).map((h, i) => (
                <tr key={i} className="border-b border-line text-ink-soft">
                  <td className="whitespace-nowrap py-2 pr-4">{new Date(h.created_at).toLocaleString("pt-BR", { timeZone: TZ, dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="pr-4">{KIND_LABEL[h.kind]}</td>
                  <td className="max-w-[260px] truncate pr-4 text-ink">{h.kind === "view" ? pageLabel(h.path) : targetLabel(h.target)}</td>
                  <td className="pr-4">{h.source}</td>
                  <td className="pr-4">{[h.city, h.region, h.country].filter(Boolean).join(", ") || "—"}</td>
                  <td>{h.device} · {h.browser}</td>
                </tr>
              ))}
              {!hits.length && <tr><td colSpan={6} className="py-6 text-center text-muted">Nenhum acesso neste período ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value = null, text, hint }: { label: string; value?: number | null; text?: string; hint?: string }) {
  return (
    <div className="bg-white p-5">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-4xl leading-none text-ink">{text ?? (value === null ? "—" : fmt(value))}</p>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function DailyBars({ series }: { series: { day: string; views: number; visitors: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.views));
  const label = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const ticks = max >= 4 ? [0, Math.round(max / 2), max] : [0, max];
  return (
    <div className="mt-6">
      <div className="flex gap-3">
        <div className="flex h-48 flex-col-reverse justify-between text-right text-xs text-muted" aria-hidden>
          {ticks.map((t, i) => <span key={i} className="leading-none">{fmt(t)}</span>)}
        </div>
        <div className="relative flex h-48 flex-1 items-end gap-[2px] border-b border-line">
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-line" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-line" />
          {series.map((s) => (
            <div key={s.day} className="group relative flex h-full flex-1 items-end justify-center" tabIndex={0}>
              <div className="w-full max-w-10 rounded-t-[4px] bg-gold transition-colors group-hover:bg-gold-dark group-focus:bg-gold-dark"
                style={{ height: `${(s.views / max) * 100}%`, minHeight: s.views ? 2 : 0 }} />
              <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap bg-ink px-3 py-2 text-xs text-paper shadow-lg group-hover:block group-focus:block">
                <b className="font-medium">{label(s.day)}</b><br />{fmt(s.views)} páginas · {fmt(s.visitors)} visitantes
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ml-8 mt-2 flex justify-between text-xs text-muted">
        <span>{label(series[0].day)}</span>
        {series.length > 2 && <span>{label(series[Math.floor(series.length / 2)].day)}</span>}
        <span>{label(series[series.length - 1].day)}</span>
      </div>
    </div>
  );
}

function Ranked({ title, unit, rows, note }: { title: string; unit: string; rows: [string, number][]; note?: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <section className="border border-line bg-white p-6">
      <h2 className="text-2xl">{title}</h2>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      <table className="mt-4 w-full text-sm">
        <thead className="sr-only"><tr><th>Item</th><th>{unit}</th></tr></thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-line last:border-0">
              <td className="relative py-2 pr-3">
                <div className="absolute inset-y-1 left-0 rounded-r-[4px] bg-gold-light/45" style={{ width: `${(v / max) * 100}%` }} aria-hidden />
                <span className="relative block truncate text-ink">{k}</span>
              </td>
              <td className="w-16 py-2 text-right tabular-nums text-ink-soft">{fmt(v)}</td>
            </tr>
          ))}
          {!rows.length && <tr><td className="py-4 text-muted">Sem dados ainda.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

function Funnel({ steps }: { steps: { label: string; n: number }[] }) {
  const max = Math.max(1, steps[0].n);
  return (
    <ol className="mt-6 space-y-3">
      {steps.map((s, i) => (
        <li key={s.label} className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[14rem_minmax(0,1fr)_4.5rem]">
          <span className="text-sm text-ink">{s.label}</span>
          <span className="text-right text-sm tabular-nums text-muted sm:order-last" title="em relação à etapa anterior">
            {i ? pct(s.n, steps[i - 1].n) : ""}
          </span>
          <div className="relative col-span-2 h-9 bg-linen sm:col-span-1">
            <div className="h-full rounded-r-[4px] bg-gold" style={{ width: `${(s.n / max) * 100}%`, minWidth: s.n ? 2 : 0 }} aria-hidden />
            <span className="absolute inset-y-0 left-3 flex items-center text-sm font-medium tabular-nums text-ink">{fmt(s.n)}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Table({ title, head, rows, note }: { title: string; head: string[]; rows: string[][]; note?: string }) {
  return (
    <section className="border border-line bg-white p-6">
      <h2 className="text-2xl">{title}</h2>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-[0.68rem] uppercase tracking-[0.16em] text-gold-dark">
            <tr className="border-b border-gold-light">
              {head.map((h, i) => <th key={h} className={`py-2 font-medium ${i ? "pl-3 text-right" : "text-left"}`}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-b border-line last:border-0">
                {r.map((c, i) => <td key={i} className={`py-2 ${i ? "pl-3 text-right tabular-nums text-ink-soft" : "max-w-[260px] truncate text-ink"}`}>{c}</td>)}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={head.length} className="py-4 text-muted">Sem dados ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
