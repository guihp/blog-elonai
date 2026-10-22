"use client";

import { useState } from "react";

// Builds tracked links (utm_source + utm_campaign) so every post, bio link and email shows up by name in the dashboard.
const SOURCES = ["instagram", "facebook", "pinterest", "tiktok", "youtube", "whatsapp", "email", "church"];

const slugify = (v: string) =>
  v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function UtmBuilder({ siteUrl, pages }: { siteUrl: string; pages: { path: string; label: string }[] }) {
  const [page, setPage] = useState(pages[0]?.path ?? "/");
  const [source, setSource] = useState("instagram");
  const [campaign, setCampaign] = useState("");
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams({ utm_source: slugify(source) || "outro" });
  if (slugify(campaign)) params.set("utm_campaign", slugify(campaign));
  const url = `${siteUrl.replace(/\/$/, "")}${page}?${params}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const label = "mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted";
  return (
    <section className="mt-8 border border-line bg-white p-6">
      <h2 className="text-2xl">Gerador de links rastreados</h2>
      <p className="mt-1 text-sm text-muted">
        Use estes links ao divulgar. Eles aparecem em “De onde vieram” e “Campanhas” com o nome que você escolher.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <label className="block">
          <span className={label}>Página</span>
          <select value={page} onChange={(e) => setPage(e.target.value)} className="field !bg-white">
            {pages.map((p) => <option key={p.path} value={p.path}>{p.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={label}>Onde vai postar</span>
          <input list="utm-sources" value={source} onChange={(e) => setSource(e.target.value)} className="field !bg-white" />
          <datalist id="utm-sources">{SOURCES.map((s) => <option key={s} value={s} />)}</datalist>
        </label>
        <label className="block">
          <span className={label}>Campanha / post</span>
          <input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="ex.: bio, reels-ansiedade, email-semana-3" className="field !bg-white" />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <code className="min-w-0 flex-1 break-all border border-line bg-linen px-4 py-3 text-sm text-ink">{url}</code>
        <button type="button" onClick={copy} className="btn btn-ink shrink-0">{copied ? "Copiado ✓" : "Copiar link"}</button>
      </div>
      <p className="mt-3 text-xs text-muted">
        Dica: use sempre os mesmos nomes (tudo minúsculo, com hífen). “instagram” e “Instagram-bio” viram fontes diferentes.
      </p>
    </section>
  );
}
