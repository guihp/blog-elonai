import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HOLIDAYS } from "@/content/social";
import { requireAdminPage } from "@/lib/admin-guard";
import { books, getPosts, site } from "@/lib/content";
import { isDateKey } from "@/lib/daily";
import { getDailyWords } from "@/lib/daily-words";
import { dayNumber, etToBrt, holidayOn, shiftKey, upcomingHolidays, weekday } from "@/lib/social/calendar";
import { PLATFORM_LABEL, planDay, type Platform, type SocialItem } from "@/lib/social/plan";
import { supabaseAdmin } from "@/lib/supabase";
import AdminNav from "../AdminNav";
import { toggleDone } from "./actions";
import CopyBlock from "./CopyBlock";

export const metadata: Metadata = { title: "Divulgação", robots: { index: false, follow: false } };

export default function SocialPage({ searchParams }: PageProps<"/admin/social">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Social searchParams={searchParams} />
    </Suspense>
  );
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const FORMAT: Record<SocialItem["format"], string> = { image: "Com imagem", text: "Só texto", pin: "Pin" };
const nyToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const longDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

async function Social({ searchParams }: Pick<PageProps<"/admin/social">, "searchParams">) {
  await requireAdminPage();
  const sp = await searchParams;
  const today = nyToday();
  const date = typeof sp.d === "string" && isDateKey(sp.d) ? sp.d : today;
  const [words, posts] = await Promise.all([getDailyWords(), getPosts()]);
  const input = { site: site.site_url.replace(/\/$/, ""), words, posts, books };

  const sunday = shiftKey(date, -weekday(date));
  const week = Array.from({ length: 7 }, (_, i) => shiftKey(sunday, i));
  const db = supabaseAdmin();
  const { data } = db
    ? await db.from("social_done").select("key").gte("key", sunday).lt("key", shiftKey(sunday, 7))
    : { data: [] as { key: string }[] };
  const done = new Set((data ?? []).map((r) => r.key));

  const items = planDay(date, input);
  const holiday = holidayOn(date);
  const upcoming = upcomingHolidays(shiftKey(date, 1), 60);
  const groups: Platform[] = ["page", "group", "pinterest"];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-8">
      <AdminNav current="/admin/social" title="Divulgação">
        <Link href="/admin/social/guide" className="btn btn-ink !py-2.5">Guia: configurar e divulgar</Link>
      </AdminNav>

      <p className="mt-6 max-w-3xl text-sm text-muted">
        Os posts de cada dia, prontos para copiar. Os horários são de Nova York (entre parênteses, o horário de Brasília).
        Rotina sugerida: no domingo, gere as imagens da semana no ChatGPT e agende tudo de uma vez (Página e Instagram no
        Meta Business Suite, o grupo no próprio grupo, os pins no Pinterest). Depois é só responder comentários e mensagens.
      </p>

      <nav className="mt-6 grid grid-cols-7 gap-1.5" aria-label="Semana">
        {week.map((d) => {
          const total = planDay(d, input).length;
          const count = [...done].filter((k) => k.startsWith(`${d}:`)).length;
          const h = holidayOn(d);
          return (
            <Link
              key={d}
              href={`/admin/social?d=${d}`}
              className={`border px-2 py-2 text-center text-xs ${d === date ? "border-ink bg-ink text-paper" : "border-line bg-white hover:bg-linen"}`}
            >
              <span className="block uppercase tracking-widest">{WEEKDAYS[weekday(d)]}</span>
              <span className="block font-serif text-2xl">{Number(d.slice(8))}</span>
              <span className="block">{count}/{total}{d === today ? " · hoje" : ""}</span>
              {h && <span className="mt-1 block truncate text-[0.65rem] text-gold">{HOLIDAYS[h].pt}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-2 flex justify-between text-sm">
        <Link href={`/admin/social?d=${shiftKey(sunday, -7)}`} className="text-ink-soft hover:underline">← Semana anterior</Link>
        {date !== today && <Link href="/admin/social" className="text-ink-soft hover:underline">Hoje</Link>}
        <Link href={`/admin/social?d=${shiftKey(sunday, 7)}`} className="text-ink-soft hover:underline">Próxima semana →</Link>
      </div>

      <h2 className="mt-10 text-3xl first-letter:uppercase">{longDate(date)}</h2>
      {holiday && (
        <p className="mt-3 border-l-2 border-gold bg-linen px-4 py-3 text-sm">
          <b>{HOLIDAYS[holiday].pt}</b> nos EUA. O post do meio-dia, o do grupo e um pin hoje são sobre a data. {HOLIDAYS[holiday].tip}
        </p>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_17rem]">
        <div className="space-y-10">
          {groups.map((platform) => (
            <section key={platform}>
              <h3 className="border-b border-line pb-2 text-2xl">{PLATFORM_LABEL[platform]}</h3>
              <div className="mt-4 space-y-5">
                {items.filter((i) => i.platform === platform).map((item) => (
                  <Card key={item.key} item={item} date={date} done={done.has(item.key)} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-6 text-sm">
          <div className="border border-line bg-white p-4">
            <p className="eyebrow !text-[0.62rem]">Próximas datas (EUA)</p>
            <ul className="mt-3 space-y-2">
              {upcoming.map((h) => (
                <li key={h.key + h.date}>
                  <Link href={`/admin/social?d=${h.date}`} className="hover:underline">
                    <b>{HOLIDAYS[h.key].pt}</b>
                  </Link>
                  <span className="block text-xs text-muted">
                    {new Date(`${h.date}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" })} · em{" "}
                    {dayNumber(h.date) - dayNumber(date)} dias
                  </span>
                </li>
              ))}
              {!upcoming.length && <li className="text-muted">Nenhuma nos próximos 60 dias.</li>}
            </ul>
          </div>
          <div className="border border-line bg-white p-4 text-ink-soft">
            <p className="eyebrow !text-[0.62rem]">Como usar cada post</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-4">
              <li>Se tiver prompt, cole no ChatGPT e baixe a imagem. Confira se o versículo saiu escrito certinho.</li>
              <li>Copie o texto e publique ou agende no horário indicado.</li>
              <li>Depois de publicar, cole o 1º comentário com o link.</li>
              <li>Marque “Postado”.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ item, date, done }: { item: SocialItem; date: string; done: boolean }) {
  return (
    <article className={`border bg-white p-5 ${done ? "border-sage/60 opacity-70" : "border-line"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted">
            {item.time} em Nova York ({etToBrt(date, item.time)} em Brasília) ·{" "}
            <span className="font-medium text-ink-soft">{FORMAT[item.format]}</span>
          </p>
          <h4 className="mt-1 font-serif text-xl">{item.label}</h4>
        </div>
        <form action={toggleDone}>
          <input type="hidden" name="key" value={item.key} />
          <input type="hidden" name="done" value={done ? "0" : "1"} />
          <button className={`border px-3 py-1.5 text-sm ${done ? "border-sage bg-sage text-white" : "border-line hover:bg-linen"}`}>
            {done ? "Postado ✓" : "Marcar como postado"}
          </button>
        </form>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{item.why}</p>

      <div className="mt-4 grid gap-3">
        {item.imagePrompt && <CopyBlock label="1. Prompt da imagem (cole no ChatGPT)" text={item.imagePrompt} small />}
        {item.siteImage && (
          <p className="text-xs text-muted">
            Ou use a imagem que já está no site:{" "}
            <a href={item.siteImage} target="_blank" rel="noopener noreferrer" className="underline">abrir e salvar</a>
          </p>
        )}
        {item.text && <CopyBlock label={item.imagePrompt ? "2. Texto do post" : "Texto do post"} text={item.text} />}
        {item.firstComment && <CopyBlock label="Primeiro comentário (cole depois de publicar)" text={item.firstComment} />}
        {item.instagram && <CopyBlock label="Legenda para o Instagram" text={item.instagram} small />}
        {item.pin && (
          <>
            <CopyBlock label="2. Título do pin" text={item.pin.title} />
            <CopyBlock label="3. Descrição do pin" text={item.pin.description} />
            <CopyBlock label="4. Link de destino" text={item.pin.link} />
            <p className="text-xs text-muted">Pasta (board): <b className="text-ink-soft">{item.pin.board}</b></p>
          </>
        )}
      </div>
    </article>
  );
}
